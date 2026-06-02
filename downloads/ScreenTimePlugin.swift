import Foundation
import Capacitor
import FamilyControls
import ManagedSettings
import DeviceActivity
import SwiftUI

/**
 ScreenTime — iOS native plugin (Phase 2)

 Apple's Screen Time APIs intentionally do NOT expose raw per-app minutes to the
 app — the data stays on device and out of our reach. So `getUsageToday` returns
 empty on iOS. What we CAN do, and what this ministry actually needs, is:
   • ask the user to pick which apps to watch (FamilyActivityPicker)
   • set a daily threshold (DeviceActivity)
   • when the threshold is crossed, SHIELD the app — replace its screen with a
     verse + breath (ManagedSettings + a ShieldConfiguration extension).

 Requires the `com.apple.developer.family-controls` entitlement (request early —
 manual Apple approval). Threshold handling + shield styling live in two app
 extensions; their code is in Phase-2-Setup.md.

 File: ios/App/App/ScreenTimePlugin.swift  (register via ScreenTimePlugin.m)
 */
@available(iOS 16.0, *)
@objc(ScreenTimePlugin)
public class ScreenTimePlugin: CAPPlugin {

    private let store = ManagedSettingsStore(named: .init("wvw.shield"))
    private let center = AuthorizationCenter.shared

    @objc func isSupported(_ call: CAPPluginCall) {
        if #available(iOS 16.0, *) {
            call.resolve(["supported": true, "platform": "ios", "mode": "shield"])
        } else {
            call.resolve(["supported": false, "platform": "ios", "mode": "demo"])
        }
    }

    @objc func checkAuthorization(_ call: CAPPluginCall) {
        call.resolve(["granted": center.authorizationStatus == .approved])
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        Task {
            do {
                try await center.requestAuthorization(for: .individual)
                let granted = AuthorizationCenter.shared.authorizationStatus == .approved
                call.resolve(["granted": granted])
            } catch {
                call.resolve(["granted": false])
            }
        }
    }

    /// iOS keeps raw minutes private — there is no API to read them. By design.
    @objc func getUsageToday(_ call: CAPPluginCall) {
        call.resolve(["totalMinutes": 0, "apps": [], "date": "ios-private"])
    }

    @objc func getForegroundApp(_ call: CAPPluginCall) {
        // Not available on iOS — the shield is event-driven, not poll-driven.
        call.resolve(["packageId": "", "appName": ""])
    }

    /// Present Apple's system app picker (SwiftUI) and persist the opaque
    /// selection tokens to the shared App Group for the monitor extension.
    @objc func pickApps(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let presenter = self.bridge?.viewController else {
                call.reject("no-view-controller"); return
            }
            let model = SelectionStore.shared
            let view = PickerSheet(model: model) { count in
                presenter.dismiss(animated: true) {
                    call.resolve(["count": count, "tokens": []])  // tokens are opaque; saved to App Group
                }
            }
            let host = UIHostingController(rootView: view)
            host.modalPresentationStyle = .formSheet
            presenter.present(host, animated: true)
        }
    }

    /// Arm a daily threshold for the picked apps. When crossed, the monitor
    /// extension applies the shield (see DeviceActivityMonitor extension).
    @objc func setDailyLimit(_ call: CAPPluginCall) {
        let minutes = call.getInt("minutes") ?? 120
        let selection = SelectionStore.shared.selection
        guard !selection.applicationTokens.isEmpty || !selection.categoryTokens.isEmpty else {
            call.reject("no-apps-picked"); return
        }

        let schedule = DeviceActivitySchedule(
            intervalStart: DateComponents(hour: 0, minute: 0),
            intervalEnd: DateComponents(hour: 23, minute: 59),
            repeats: true
        )
        let event = DeviceActivityEvent(
            applications: selection.applicationTokens,
            categories: selection.categoryTokens,
            threshold: DateComponents(minute: minutes)
        )

        let activityCenter = DeviceActivityCenter()
        do {
            activityCenter.stopMonitoring([.daily])
            try activityCenter.startMonitoring(
                .daily,
                during: schedule,
                events: [.reachedLimit: event]
            )
            call.resolve(["granted": true])
        } catch {
            call.reject("monitor-failed: \(error.localizedDescription)")
        }
    }

    /// Apply the shield to the selected apps immediately.
    @objc func shieldNow(_ call: CAPPluginCall) {
        let selection = SelectionStore.shared.selection
        store.shield.applications =
            selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
        store.shield.applicationCategories =
            selection.categoryTokens.isEmpty ? nil : .specific(selection.categoryTokens)
        call.resolve()
    }

    @objc func clearShield(_ call: CAPPluginCall) {
        store.shield.applications = nil
        store.shield.applicationCategories = nil
        call.resolve()
    }
}

// MARK: - Names

@available(iOS 16.0, *)
extension DeviceActivityName {
    static let daily = Self("wvw.daily")
}
@available(iOS 16.0, *)
extension DeviceActivityEvent.Name {
    static let reachedLimit = Self("wvw.reachedLimit")
}

// MARK: - Shared selection (App Group)

/// Stores the user's FamilyActivitySelection so the plugin AND the monitor
/// extension see the same chosen apps. Encoded into the shared App Group defaults.
@available(iOS 16.0, *)
final class SelectionStore: ObservableObject {
    static let shared = SelectionStore()
    private let suite = UserDefaults(suiteName: "group.org.wifivstheword.app")
    private let key = "familySelection"

    @Published var selection: FamilyActivitySelection {
        didSet { save() }
    }

    private init() {
        if let data = suite?.data(forKey: key),
           let decoded = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
            selection = decoded
        } else {
            selection = FamilyActivitySelection()
        }
    }

    private func save() {
        if let data = try? JSONEncoder().encode(selection) {
            suite?.set(data, forKey: key)
        }
    }
}

// MARK: - Picker sheet

@available(iOS 16.0, *)
struct PickerSheet: View {
    @ObservedObject var model: SelectionStore
    var onDone: (Int) -> Void

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $model.selection)
                .navigationTitle("Apps to watch")
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") {
                            let count = model.selection.applicationTokens.count
                                + model.selection.categoryTokens.count
                            onDone(count)
                        }
                    }
                }
        }
    }
}
