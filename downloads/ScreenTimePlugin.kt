package org.wifivstheword.app

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Process
import android.provider.Settings
import androidx.activity.result.ActivityResult
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import java.util.Calendar

/**
 * ScreenTime — Android native plugin (Phase 2)
 *
 * Real per-app usage via UsageStatsManager (requires the user to grant
 * "Usage access" in system settings — a special permission, not a runtime prompt).
 * The Scripture Shield is delivered by [ScreenGuardService] (a foreground service
 * that polls the foreground app and launches [ShieldActivity] over watched apps
 * past their limit). Those companion classes are in Phase-2-Setup.md.
 *
 * File: android/app/src/main/java/org/wifivstheword/app/ScreenTimePlugin.kt
 */
@CapacitorPlugin(name = "ScreenTime")
class ScreenTimePlugin : Plugin() {

    @PluginMethod
    fun isSupported(call: PluginCall) {
        call.resolve(JSObject().apply {
            put("supported", true)
            put("platform", "android")
            put("mode", "usage")
        })
    }

    private fun hasUsageAccess(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    @PluginMethod
    fun checkAuthorization(call: PluginCall) {
        call.resolve(JSObject().put("granted", hasUsageAccess()))
    }

    @PluginMethod
    fun requestAuthorization(call: PluginCall) {
        if (hasUsageAccess()) {
            call.resolve(JSObject().put("granted", true))
            return
        }
        startActivityForResult(call, Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS), "usageAccessResult")
    }

    @ActivityCallback
    private fun usageAccessResult(call: PluginCall?, result: ActivityResult) {
        call?.resolve(JSObject().put("granted", hasUsageAccess()))
    }

    @PluginMethod
    fun getUsageToday(call: PluginCall) {
        if (!hasUsageAccess()) { call.reject("usage-access-not-granted"); return }

        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }
        val start = cal.timeInMillis
        val end = System.currentTimeMillis()

        // INTERVAL_DAILY can return several buckets; sum foreground time per package.
        val totals = HashMap<String, Long>()
        usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end)?.forEach { s ->
            if (s.totalTimeInForeground > 0) {
                totals[s.packageName] = (totals[s.packageName] ?: 0L) + s.totalTimeInForeground
            }
        }

        val pm = context.packageManager
        val apps = JSArray()
        var totalMinutes = 0L
        totals.entries
            .sortedByDescending { it.value }
            .forEach { (pkg, ms) ->
                val minutes = ms / 60000L
                if (minutes < 1) return@forEach
                if (pkg == context.packageName) return@forEach   // don't count ourselves
                val label = try {
                    pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
                } catch (e: Exception) { pkg }
                apps.put(JSObject().apply {
                    put("appName", label)
                    put("packageId", pkg)
                    put("minutes", minutes)
                })
                totalMinutes += minutes
            }

        call.resolve(JSObject().apply {
            put("totalMinutes", totalMinutes)
            put("apps", apps)
            put("date", "today")
        })
    }

    @PluginMethod
    fun getForegroundApp(call: PluginCall) {
        if (!hasUsageAccess()) { call.reject("usage-access-not-granted"); return }
        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val end = System.currentTimeMillis()
        val events = usm.queryEvents(end - 10_000, end)
        val e = UsageEvents.Event()
        var last: String? = null
        while (events.hasNextEvent()) {
            events.getNextEvent(e)
            if (e.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) last = e.packageName
        }
        val ret = JSObject()
        if (last != null) {
            val pm = context.packageManager
            val label = try {
                pm.getApplicationLabel(pm.getApplicationInfo(last, 0)).toString()
            } catch (ex: Exception) { last }
            ret.put("packageId", last); ret.put("appName", label)
        } else {
            ret.put("packageId", ""); ret.put("appName", "")
        }
        call.resolve(ret)
    }

    /**
     * Persist watched packages + limit and (re)start the guard service.
     * Android has no system-level shield API, so the shield is our own overlay.
     */
    @PluginMethod
    fun setDailyLimit(call: PluginCall) {
        val minutes = call.getInt("minutes") ?: 120
        val apps = call.getArray("apps")?.toString() ?: "[]"
        context.getSharedPreferences("screenguard", Context.MODE_PRIVATE)
            .edit()
            .putInt("limitMinutes", minutes)
            .putString("watched", apps)
            .apply()

        val i = Intent(context, ScreenGuardService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(i)
        else context.startService(i)

        call.resolve(JSObject().put("granted", true))
    }

    @PluginMethod
    fun shieldNow(call: PluginCall) {
        val intent = Intent(context, ShieldActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            .putExtra("reference", call.getString("reference") ?: "")
            .putExtra("text", call.getString("text") ?: "")
        context.startActivity(intent)
        call.resolve()
    }

    @PluginMethod
    fun clearShield(call: PluginCall) {
        context.stopService(Intent(context, ScreenGuardService::class.java))
        call.resolve()
    }
}
