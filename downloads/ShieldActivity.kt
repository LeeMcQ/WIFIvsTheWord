package org.wifivstheword.app

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.app.Activity
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * ShieldActivity — the Android "Scripture Shield" overlay (Phase 2).
 *
 * Full-screen candlelight interrupt shown over a watched app once it passes the
 * daily limit. Mirrors the prototype's ScriptureShield: a slow breathing glow,
 * the verse, and two gentle choices — "Step away" (go home) and "Open anyway".
 * Built in pure Kotlin views so it has no XML/Compose dependency.
 *
 * File: android/app/src/main/java/org/wifivstheword/app/ShieldActivity.kt
 */
class ShieldActivity : Activity() {

    private val ink = Color.parseColor("#0b1322")
    private val cream = Color.parseColor("#f4ecd8")
    private val gold = Color.parseColor("#e3b465")
    private val mist = Color.parseColor("#9fb0c8")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val reference = intent.getStringExtra("reference") ?: "Psalm 46:10"
        val text = intent.getStringExtra("text") ?: "Be still, and know that I am God."

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(ink)
            setPadding(dp(34), dp(34), dp(34), dp(40))
        }

        // breathing glow
        val glow = View(this).apply {
            background = GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, intArrayOf(gold, ink)).apply {
                shape = GradientDrawable.OVAL
            }
            alpha = 0.5f
        }
        root.addView(glow, LinearLayout.LayoutParams(dp(120), dp(120)).apply { bottomMargin = dp(28) })
        ValueAnimator.ofFloat(0.85f, 1.12f).apply {
            duration = 5500; repeatCount = ValueAnimator.INFINITE; repeatMode = ValueAnimator.REVERSE
            addUpdateListener {
                val v = it.animatedValue as Float
                glow.scaleX = v; glow.scaleY = v; glow.alpha = 0.35f + (v - 0.85f)
            }
            start()
        }

        root.addView(TextView(this).apply {
            this.text = text
            setTextColor(cream)
            textSize = 26f
            gravity = Gravity.CENTER
            setLineSpacing(dp(4).toFloat(), 1f)
        })
        root.addView(TextView(this).apply {
            this.text = reference.uppercase()
            setTextColor(gold)
            textSize = 12f
            letterSpacing = 0.22f
            gravity = Gravity.CENTER
            setPadding(0, dp(14), 0, 0)
        })
        root.addView(TextView(this).apply {
            this.text = "Breathe. The feed will still be there."
            setTextColor(mist)
            textSize = 15f
            gravity = Gravity.CENTER
            setPadding(0, dp(26), 0, dp(30))
        })

        root.addView(goldButton("Step away — I'll choose the Word") {
            // send the user home; the shield simply lets go
            val home = android.content.Intent(android.content.Intent.ACTION_MAIN).apply {
                addCategory(android.content.Intent.CATEGORY_HOME)
                flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(home)
            finish()
        })
        root.addView(ghostButton("Open anyway (5 min)") {
            // a grace-not-guilt escape hatch; just dismiss
            finish()
        })

        setContentView(root)
    }

    private fun goldButton(label: String, onClick: () -> Unit) = Button(this).apply {
        text = label
        setTextColor(Color.parseColor("#2a1d05"))
        textSize = 15f
        isAllCaps = false
        background = GradientDrawable().apply { cornerRadius = dp(999).toFloat(); setColor(gold) }
        setOnClickListener { onClick() }
        layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(52)).apply {
            leftMargin = dp(8); rightMargin = dp(8)
        }
    }

    private fun ghostButton(label: String, onClick: () -> Unit) = Button(this).apply {
        text = label
        setTextColor(mist)
        textSize = 14f
        isAllCaps = false
        background = GradientDrawable().apply {
            cornerRadius = dp(999).toFloat(); setColor(Color.TRANSPARENT)
            setStroke(dp(1), Color.parseColor("#33e3b465"))
        }
        setOnClickListener { onClick() }
        layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(44)).apply {
            topMargin = dp(12); gravity = Gravity.CENTER
        }
    }

    override fun onBackPressed() {
        // back = step away, not back into the app
        val home = android.content.Intent(android.content.Intent.ACTION_MAIN).apply {
            addCategory(android.content.Intent.CATEGORY_HOME)
            flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(home)
        finish()
    }

    private fun dp(v: Int): Int = (v * resources.displayMetrics.density).toInt()
}
