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
import android.view.accessibility.AccessibilityNodeInfo
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.By
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.Until
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.net.URL
import javax.net.ssl.HttpsURLConnection
import org.json.JSONObject
import org.json.JSONArray
import java.security.MessageDigest

class BootstrapShellTest {
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
    val targetPackage = "org.agoraweave.app"
    val launch = context.packageManager.getLaunchIntentForPackage(targetPackage)
    assertNotNull(launch)
    launch!!.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
    device.pressHome()
    context.startActivity(launch)
    assertTrue(device.wait(Until.hasObject(By.pkg(targetPackage).depth(0)), 15000))
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
    assertTrue(device.wait(Until.gone(By.pkg(targetPackage).depth(0)), 10000))
    context.startActivity(context.packageManager.getLaunchIntentForPackage(targetPackage)!!.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    assertTrue(device.wait(Until.hasObject(By.pkg(targetPackage).depth(0)), 15000))
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
    assertEquals("android.widget.TextView", title.className.toString())
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
    fun systemPixels(name: String): Int {
      val resource = context.resources.getIdentifier(name, "dimen", "android")
      return if (resource == 0) 0 else context.resources.getDimensionPixelSize(resource)
    }
    val viewport = Rect(0, systemPixels("status_bar_height"), device.displayWidth,
      device.displayHeight - systemPixels("navigation_bar_height"))
    assertTrue("Title bounds must remain within the visible safe content", viewport.contains(bounds))
    fun rect(value: Rect) = JSONObject().put("x", value.left).put("y", value.top).put("width", value.width()).put("height", value.height())
    fun hash(bytes: ByteArray) = MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it.toInt() and 255) }
    val measurement = JSONObject().put("theme", theme).put("font_scale", context.resources.configuration.fontScale.toDouble())
      .put("title", title.text.toString()).put("role", title.className.toString()).put("enabled", title.isEnabled)
      .put("heading", heading).put("accessibility_focused", title.isAccessibilityFocused).put("title_count", titles.size)
      .put("interactive_count", interactiveCount).put("editable_count", editableCount).put("frame", rect(bounds)).put("viewport", rect(viewport))
      .put("tree_sha256", hash(File(captureRoot, "bootstrap-ui.xml").readBytes())).put("screenshot_sha256", hash(capture.readBytes()))
      .put("audit", JSONObject().put("method", "native-semantic-focus").put("executed", true).put("issues", JSONArray()))
    File(captureRoot, "bootstrap-accessibility.json").writeText(JSONObject().put("source", "native-android-accessibility")
      .put("measurement", measurement).toString())
    bitmap.recycle()
  }
}
