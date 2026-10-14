import XCTest

final class BootstrapShellTests: XCTestCase {
  func testLaunchAndBackgroundResume() {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.agoraweave.app")
    app.launch()
    XCTAssertTrue(app.staticTexts["AgoraWeave"].waitForExistence(timeout: 15))
    XCTAssertTrue(app.wait(for: .runningForeground, timeout: 5))
    let launch = XCTAttachment(screenshot: app.screenshot())
    launch.name = "bootstrap-launch"
    launch.lifetime = .keepAlways
    add(launch)
    XCUIDevice.shared.press(.home)
    XCTAssertTrue(app.wait(for: .runningBackground, timeout: 5))
    app.activate()
    XCTAssertTrue(app.wait(for: .runningForeground, timeout: 5))
    XCTAssertTrue(app.staticTexts["AgoraWeave"].waitForExistence(timeout: 10))
    let resume = XCTAttachment(screenshot: app.screenshot())
    resume.name = "bootstrap-resume"
    resume.lifetime = .keepAlways
    add(resume)
  }
}
