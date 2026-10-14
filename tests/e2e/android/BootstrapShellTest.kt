package org.agoraweave.bootstrap

import android.content.Intent
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
    val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    val targetPackage = "org.agoraweave.app"
    val launch = context.packageManager.getLaunchIntentForPackage(targetPackage)
    assertNotNull(launch)
    launch!!.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
    device.pressHome()
    context.startActivity(launch)
    assertTrue(device.wait(Until.hasObject(By.text("AgoraWeave")), 15000))
    assertEquals(targetPackage, device.currentPackageName)
    device.pressHome()
    assertTrue(device.wait(Until.gone(By.text("AgoraWeave")), 10000))
    context.startActivity(context.packageManager.getLaunchIntentForPackage(targetPackage)!!.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    assertTrue(device.wait(Until.hasObject(By.text("AgoraWeave")), 10000))
    assertEquals(targetPackage, device.currentPackageName)
    val captureRoot = context.getExternalFilesDir(null)!!
    device.dumpWindowHierarchy(File(captureRoot, "bootstrap-ui.xml"))
    assertTrue(device.takeScreenshot(File(captureRoot, "bootstrap-resume.png")))
  }
}
