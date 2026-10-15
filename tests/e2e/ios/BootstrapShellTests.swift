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
    let background = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
      app.state == .runningBackground || app.state == .runningBackgroundSuspended
    }, object: app)
    let backgroundResult = XCTWaiter.wait(for: [background], timeout: 5)
    let observed = XCTAttachment(string: "actual-background-state=\(app.state.rawValue)")
    observed.name = "bootstrap-background-state"
    observed.lifetime = .keepAlways
    add(observed)
    XCTAssertEqual(backgroundResult, .completed)
    app.activate()
    XCTAssertTrue(app.wait(for: .runningForeground, timeout: 5))
    XCTAssertTrue(app.staticTexts["AgoraWeave"].waitForExistence(timeout: 10))
    let resume = XCTAttachment(screenshot: app.screenshot())
    resume.name = "bootstrap-resume"
    resume.lifetime = .keepAlways
    add(resume)
  }
}
