package org.agoraweave.bootstrap

import android.content.Intent
import android.content.res.Configuration
import android.app.UiModeManager
import android.content.Context
import android.os.Build
import android.os.SystemClock
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Rect
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.text.Spanned
import android.text.TextPaint
import android.text.style.MetricAffectingSpan
import android.view.accessibility.AccessibilityNodeInfo
import android.view.accessibility.AccessibilityManager
import android.accessibilityservice.AccessibilityServiceInfo
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
import androidx.test.runner.lifecycle.ActivityLifecycleMonitorRegistry
import androidx.test.runner.lifecycle.Stage
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.By
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.Until
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.After
import java.io.File
import java.io.FileInputStream
import java.net.URL
import javax.net.ssl.HttpsURLConnection
import org.json.JSONObject
import org.json.JSONArray
import java.security.MessageDigest

class BootstrapShellTest {
  private var originalAccessibilityFlags: Int? = null

  @After
  fun restoreAccessibilityService() {
    originalAccessibilityFlags?.let { flags ->
      val automation = InstrumentationRegistry.getInstrumentation().uiAutomation
      val service = automation.serviceInfo
      service.flags = flags
      automation.serviceInfo = service
    }
  }

  @Test
  fun launchAndBackgroundResume() {
    val context = InstrumentationRegistry.getInstrumentation().targetContext
    val theme = InstrumentationRegistry.getArguments().getString("theme")
    assertTrue("An explicit expected theme is required", theme == "light" || theme == "dark")
    val expectedNight = if (theme == "dark") Configuration.UI_MODE_NIGHT_YES else Configuration.UI_MODE_NIGHT_NO
    if (Build.VERSION.SDK_INT < 29) {
      val modes = context.getSystemService(Context.UI_MODE_SERVICE) as UiModeManager
      modes.nightMode = if (theme == "dark") UiModeManager.MODE_NIGHT_YES else UiModeManager.MODE_NIGHT_NO
      val deadline = SystemClock.uptimeMillis() + 15000
      while ((context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) != expectedNight &&
        SystemClock.uptimeMillis() < deadline) SystemClock.sleep(100)
    }
    assertEquals("The actual device configuration must match the named capture theme", expectedNight,
      context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK)
    val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    val automation = InstrumentationRegistry.getInstrumentation().uiAutomation
    val service = automation.serviceInfo
    originalAccessibilityFlags = service.flags
    service.flags = service.flags or AccessibilityServiceInfo.FLAG_REQUEST_TOUCH_EXPLORATION_MODE
    automation.serviceInfo = service
    val accessibility = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
    val explorationDeadline = SystemClock.uptimeMillis() + 15000
    while (!accessibility.isTouchExplorationEnabled && SystemClock.uptimeMillis() < explorationDeadline) SystemClock.sleep(100)
    assertTrue("Native focus requires actual enabled touch exploration", accessibility.isTouchExplorationEnabled)
    val targetPackage = "org.agoraweave.app"
    val launch = context.packageManager.getLaunchIntentForPackage(targetPackage)
    assertNotNull(launch)
    launch!!.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
    val homeResolution = FileInputStream(automation.executeShellCommand(
      "cmd package resolve-activity --brief --user 0 -a android.intent.action.MAIN -c android.intent.category.HOME").fileDescriptor)
      .bufferedReader().use { it.readText() }
    val homePackage = Regex("(?m)^([A-Za-z][A-Za-z0-9_.]*)/[^\\s]+$").find(homeResolution.trim())?.groupValues?.get(1)
    assertNotNull("The actual shell package manager must resolve a HOME component: $homeResolution", homePackage)
    assertTrue(homePackage != targetPackage && homePackage != "com.android.settings")
    File(context.getExternalFilesDir(null)!!, "bootstrap-launcher-diagnostic.json").writeText(JSONObject()
      .put("instrumentation_package", InstrumentationRegistry.getInstrumentation().context.packageName)
      .put("target_package", context.packageName).put("reported_launcher", device.launcherPackageName)
      .put("shell_home_resolution", homeResolution).put("home_package", homePackage).toString())
    device.pressHome()
    assertTrue(device.wait(Until.hasObject(By.pkg(homePackage!!)), 10000))
    val observedHomePackage = device.currentPackageName
    assertEquals(homePackage, observedHomePackage)
    device.waitForIdle(5000)
    context.startActivity(launch)
    assertTrue(device.wait(Until.hasObject(By.pkg(targetPackage)), 15000))
    assertTrue(device.wait(Until.hasObject(By.pkg(targetPackage).text("AgoraWeave")), 15000))
    assertEquals(targetPackage, device.currentPackageName)
    val instrumentation = InstrumentationRegistry.getInstrumentation()
    if (instrumentation.context.assets.list("")!!.contains("https-client.json")) {
      val config = JSONObject(instrumentation.context.assets.open("https-client.json").bufferedReader().use { it.readText() })
      val environments = JSONArray()
      for (environment in listOf("dev", "test")) {
        val values = config.getJSONObject(environment)
        fun request(route: String, token: String?): Pair<Int, ByteArray> {
          val connection = URL(values.getString("url") + route).openConnection() as HttpsURLConnection
          connection.instanceFollowRedirects = false
          connection.connectTimeout = 15000
          connection.readTimeout = 15000
          if (token != null) connection.setRequestProperty("Authorization", "Bearer $token")
          return try {
            val status = connection.responseCode
            Pair(status, if (status == 200) connection.inputStream.use { it.readBytes() } else ByteArray(0))
          } finally { connection.disconnect() }
        }
        val token = values.getString("token")
        val accepted = request("/auth/v1/health", token)
        assertEquals(200, accepted.first)
        assertEquals("GoTrue", JSONObject(String(accepted.second, Charsets.UTF_8)).getString("name"))
        val anonymous = request("/auth/v1/health", null).first
        val other = request("/auth/v1/health", values.getString("other_token")).first
        val privatePath = request("/auth/v1/admin", token).first
        assertEquals(401, anonymous)
        assertEquals(401, other)
        assertEquals(404, privatePath)
        environments.put(JSONObject().put("environment", environment).put("accepted", accepted.first)
          .put("anonymous", anonymous).put("other_environment", other).put("private_path", privatePath)
          .put("body_sha256", MessageDigest.getInstance("SHA-256").digest(accepted.second).joinToString("") { "%02x".format(it.toInt() and 255) }))
      }
      File(context.getExternalFilesDir(null)!!, "bootstrap-https.json").writeText(JSONObject()
        .put("state", "passed").put("source", "native-android-httpsurlconnection")
        .put("run_id", config.getString("run_id")).put("attempt", config.getInt("attempt"))
        .put("target_sha", config.getString("target_sha")).put("environments", environments).toString())
    }
    device.pressHome()
    assertTrue(device.wait(Until.gone(By.pkg(targetPackage)), 10000))
    context.startActivity(context.packageManager.getLaunchIntentForPackage(targetPackage)!!.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    assertTrue(device.wait(Until.hasObject(By.pkg(targetPackage)), 15000))
    assertTrue(device.wait(Until.hasObject(By.pkg(targetPackage).text("AgoraWeave")), 10000))
    assertEquals(targetPackage, device.currentPackageName)
    device.waitForIdle(5000)
    InstrumentationRegistry.getInstrumentation().waitForIdleSync()
    assertEquals(targetPackage, device.currentPackageName)
    val captureRoot = context.getExternalFilesDir(null)!!
    File(captureRoot, "bootstrap-theme.txt").writeText("$theme:${context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK}")
    device.dumpWindowHierarchy(File(captureRoot, "bootstrap-ui.xml"))
    val capture = File(captureRoot, "bootstrap-resume.png")
    assertTrue(device.takeScreenshot(capture))
    val bitmap = BitmapFactory.decodeFile(capture.absolutePath)
    assertNotNull("Actual runtime capture must decode", bitmap)
    val background = bitmap.getPixel(bitmap.width / 2, bitmap.height / 4)
    val expected = if (theme == "dark") Color.rgb(17, 17, 19) else Color.WHITE
    File(captureRoot, "bootstrap-background.txt").writeText("$theme:${Color.red(background)},${Color.green(background)},${Color.blue(background)}")
    assertTrue("Rendered background must match the named theme; actual RGB=${Color.red(background)},${Color.green(background)},${Color.blue(background)}",
      kotlin.math.abs(Color.red(background) - Color.red(expected)) <= 3 &&
      kotlin.math.abs(Color.green(background) - Color.green(expected)) <= 3 &&
      kotlin.math.abs(Color.blue(background) - Color.blue(expected)) <= 3)
    val root = instrumentation.uiAutomation.rootInActiveWindow
    assertNotNull("Actual native semantic tree is required", root)
    val titles = root.findAccessibilityNodeInfosByText("AgoraWeave").filter {
      it.text?.toString() == "AgoraWeave" && it.packageName?.toString() == targetPackage
    }
    assertEquals(1, titles.size)
    val title = titles.single()
    assertTrue(title.className.toString() in listOf("android.view.View", "android.widget.TextView"))
    assertTrue(title.isEnabled)
    val heading = AccessibilityNodeInfoCompat.wrap(title).isHeading
    assertTrue("The native title must preserve its heading semantics", heading)
    assertTrue(title.performAction(AccessibilityNodeInfo.ACTION_ACCESSIBILITY_FOCUS))
    device.waitForIdle(5000)
    title.refresh()
    assertTrue("Actual semantic accessibility focus must move to the title", title.isAccessibilityFocused)
    device.dumpWindowHierarchy(File(captureRoot, "bootstrap-ui.xml"))
    assertTrue(device.takeScreenshot(capture))
    var interactiveCount = 0
    var editableCount = 0
    fun visit(node: AccessibilityNodeInfo) {
      if (node.packageName?.toString() == targetPackage && node.isVisibleToUser) {
        if (node.isClickable || node.isLongClickable) interactiveCount++
        if (node.isEditable) editableCount++
      }
      for (index in 0 until node.childCount) node.getChild(index)?.let { visit(it) }
    }
    visit(root)
    assertEquals(0, interactiveCount)
    assertEquals(0, editableCount)
    val bounds = Rect()
    title.getBoundsInScreen(bounds)
    var measuredFontPixels = 0f
    var expectedFontPixels = 0f
    var baseFontPixels = 0f
    instrumentation.runOnMainSync {
      val activity = ActivityLifecycleMonitorRegistry.getInstance().getActivitiesInStage(Stage.RESUMED).single()
      val textViews = mutableListOf<TextView>()
      fun findText(view: View) {
        if (view is TextView && view.text.toString() == "AgoraWeave") textViews.add(view)
        if (view is ViewGroup) for (index in 0 until view.childCount) findText(view.getChildAt(index))
      }
      findText(activity.window.decorView)
      assertEquals(1, textViews.size)
      val textView = textViews.single()
      baseFontPixels = textView.textSize
      val rendered = textView.text as? Spanned
      assertNotNull("React Native title must expose its actual styled text", rendered)
      val sizes = (0 until rendered!!.length).map { index ->
        val paint = TextPaint(textView.paint)
        rendered.getSpans(index, index + 1, MetricAffectingSpan::class.java).forEach { it.updateMeasureState(paint) }
        paint.textSize
      }
      assertTrue(sizes.isNotEmpty())
      measuredFontPixels = sizes.first()
      assertTrue("Every title character must use the measured rendered size", sizes.all { kotlin.math.abs(it - measuredFontPixels) <= 0.01f })
      expectedFontPixels = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, 23f, textView.resources.displayMetrics)
      File(captureRoot, "bootstrap-font-diagnostic.json").writeText(JSONObject()
        .put("measured_px", measuredFontPixels.toDouble()).put("expected_px", expectedFontPixels.toDouble())
        .put("base_px", baseFontPixels.toDouble()).put("method", "metric-affecting-spans")
        .put("font_scale", textView.resources.configuration.fontScale.toDouble())
        .put("context_font_scale", context.resources.configuration.fontScale.toDouble())
        .put("scaled_density", textView.resources.displayMetrics.scaledDensity.toDouble()).toString())
      assertTrue("Rendered native font must follow the actual platform SP conversion", kotlin.math.abs(measuredFontPixels - expectedFontPixels) <= 1f)
      assertTrue(textView.layout.lineCount > 0)
      for (line in 0 until textView.layout.lineCount) assertEquals(0, textView.layout.getEllipsisCount(line))
    }
    fun systemPixels(name: String): Int {
      val resource = context.resources.getIdentifier(name, "dimen", "android")
      return if (resource == 0) 0 else context.resources.getDimensionPixelSize(resource)
    }
    val viewport = Rect(0, systemPixels("status_bar_height"), device.displayWidth,
      device.displayHeight - systemPixels("navigation_bar_height"))
    assertTrue("Title bounds must remain within the visible safe content", viewport.contains(bounds))
    fun luminance(color: Int): Double {
      fun channel(value: Int): Double {
        val normalized = value / 255.0
        return if (normalized <= 0.04045) normalized / 12.92 else Math.pow((normalized + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * channel(Color.red(color)) + 0.7152 * channel(Color.green(color)) + 0.0722 * channel(Color.blue(color))
    }
    var minimumLuminance = 1.0
    var maximumLuminance = 0.0
    for (y in bounds.top until bounds.bottom) for (x in bounds.left until bounds.right) {
      val value = luminance(bitmap.getPixel(x, y))
      minimumLuminance = kotlin.math.min(minimumLuminance, value)
      maximumLuminance = kotlin.math.max(maximumLuminance, value)
    }
    val contrast = (maximumLuminance + 0.05) / (minimumLuminance + 0.05)
    assertTrue("Actual rendered title contrast must be readable", contrast >= 4.5)
    fun rect(value: Rect) = JSONObject().put("x", value.left).put("y", value.top).put("width", value.width()).put("height", value.height())
    fun hash(bytes: ByteArray) = MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it.toInt() and 255) }
    val measurement = JSONObject().put("theme", theme).put("font_scale", context.resources.configuration.fontScale.toDouble())
      .put("title", title.text.toString()).put("role", title.className.toString()).put("enabled", title.isEnabled)
      .put("heading", heading).put("accessibility_focused", title.isAccessibilityFocused).put("title_count", titles.size)
      .put("font_size_px", measuredFontPixels.toDouble()).put("expected_font_size_px", expectedFontPixels.toDouble()).put("contrast_ratio", contrast)
      .put("base_font_size_px", baseFontPixels.toDouble()).put("font_measurement_method", "metric-affecting-spans")
      .put("home_package", homePackage).put("observed_home_package", observedHomePackage).put("home_resolution_source", "shell-package-manager")
      .put("interactive_count", interactiveCount).put("editable_count", editableCount).put("frame", rect(bounds)).put("viewport", rect(viewport))
      .put("tree_sha256", hash(File(captureRoot, "bootstrap-ui.xml").readBytes())).put("screenshot_sha256", hash(capture.readBytes()))
      .put("audit", JSONObject().put("method", "native-semantic-focus").put("executed", true).put("issues", JSONArray()))
    File(captureRoot, "bootstrap-accessibility.json").writeText(JSONObject().put("source", "native-android-accessibility")
      .put("measurement", measurement).toString())
    bitmap.recycle()
  }
}
