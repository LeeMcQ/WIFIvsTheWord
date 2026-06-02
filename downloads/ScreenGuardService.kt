package org.wifivstheword.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import org.json.JSONArray
import java.util.Calendar

/**
 * ScreenGuardService — the engine behind the Android "Scripture Shield" (Phase 2).
 *
 * Android has no system shield API like iOS, so we run a light foreground service
 * that every few seconds checks the foreground app. If it's a watched app and the
 * user is past today's limit, we raise [ShieldActivity] over it — a verse + a breath.
 *
 * Driven by SharedPreferences "screenguard": { limitMinutes:Int, watched:JSONArray }
 * written by ScreenTimePlugin.setDailyLimit(). The shield is always user-initiated
 * (the user picked these apps and set this limit) and always dismissible.
 *
 * File: android/app/src/main/java/org/wifivstheword/app/ScreenGuardService.kt
 */
class ScreenGuardService : Service() {

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var prefs: android.content.SharedPreferences
    private var lastForeground: String? = null

    private val poll = object : Runnable {
        override fun run() {
            check()
            handler.postDelayed(this, 3000)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        prefs = getSharedPreferences("screenguard", Context.MODE_PRIVATE)
        startForeground(42, buildNotification())
        handler.removeCallbacks(poll)
        handler.post(poll)
        return START_STICKY
    }

    override fun onDestroy() {
        handler.removeCallbacks(poll)
        super.onDestroy()
    }

    private fun watchedPackages(): Set<String> {
        return try {
            val arr = JSONArray(prefs.getString("watched", "[]"))
            (0 until arr.length()).map { arr.getString(it) }.toSet()
        } catch (e: Exception) { emptySet() }
    }

    private fun check() {
        val limit = prefs.getInt("limitMinutes", 120)
        val fg = ScreenGuard.foregroundPackage(this) ?: return

        // reset the "already shielded" guard when the user moves to a different app
        if (fg != lastForeground) {
            lastForeground = fg
            prefs.edit().putString("lastShield", "").apply()
        }
        if (fg !in watchedPackages()) return
        if (ScreenGuard.minutesToday(this, fg) < limit) return
        if (prefs.getString("lastShield", "") == fg) return  // shown once per visit

        prefs.edit().putString("lastShield", fg).apply()
        startActivity(
            Intent(this, ShieldActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                .putExtra("reference", "Psalm 46:10")
                .putExtra("text", "Be still, and know that I am God.")
        )
    }

    private fun buildNotification(): Notification {
        val channelId = "wvw_guard"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(
                NotificationChannel(channelId, "Attention guard", NotificationManager.IMPORTANCE_MIN)
            )
        }
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            Notification.Builder(this, channelId) else @Suppress("DEPRECATION") Notification.Builder(this)
        return builder
            .setContentTitle("Wi-Fi vs The Word")
            .setContentText("Quietly guarding your attention")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setOngoing(true)
            .build()
    }
}

/** Shared usage helpers — same UsageStatsManager queries the plugin uses. */
object ScreenGuard {

    fun foregroundPackage(context: Context): String? {
        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val end = System.currentTimeMillis()
        val events = usm.queryEvents(end - 10_000, end)
        val event = UsageEvents.Event()
        var last: String? = null
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) last = event.packageName
        }
        return last
    }

    fun minutesToday(context: Context, packageName: String): Long {
        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }
        var ms = 0L
        usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, cal.timeInMillis, System.currentTimeMillis())
            ?.forEach { if (it.packageName == packageName) ms += it.totalTimeInForeground }
        return ms / 60000L
    }
}
