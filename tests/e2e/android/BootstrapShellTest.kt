package org.agoraweave.bootstrap

import android.content.Intent
import android.content.res.Configuration
import android.app.UiModeManager
import android.content.Context
import android.os.Build
import android.os.SystemClock
import android.graphics.BitmapFactory
import android.graphics.Color
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.By
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.Until
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

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
    bitmap.recycle()
  }
}
