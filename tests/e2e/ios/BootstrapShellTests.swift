import XCTest
import CryptoKit
import UIKit

private final class HTTPSRedirectRefusal: NSObject, URLSessionTaskDelegate {
  func urlSession(_ session: URLSession, task: URLSessionTask,
    willPerformHTTPRedirection response: HTTPURLResponse, newRequest request: URLRequest,
    completionHandler: @escaping (URLRequest?) -> Void) { completionHandler(nil) }
}

final class BootstrapShellTests: XCTestCase {
  func testLaunchAndBackgroundResume() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.agoraweave.app")
    app.launch()
    XCTAssertTrue(app.staticTexts["AgoraWeave"].waitForExistence(timeout: 15))
    XCTAssertTrue(app.wait(for: .runningForeground, timeout: 5))
    if let configURL = Bundle(for: Self.self).url(forResource: "https-client", withExtension: "json") {
      try verifyHTTPS(configURL)
    }
    let launch = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
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
    let resumeScreen = XCUIScreen.main.screenshot()
    try captureAccessibility(app, resumeScreen)
    let resume = XCTAttachment(screenshot: resumeScreen)
    resume.name = "bootstrap-resume"
    resume.lifetime = .keepAlways
    add(resume)
  }

  private func captureAccessibility(_ app: XCUIApplication, _ screenshot: XCUIScreenshot) throws {
    let diagnosticTree = XCTAttachment(string: app.debugDescription)
    diagnosticTree.name = "bootstrap-accessibility-before-assertions"
    diagnosticTree.lifetime = .keepAlways
    add(diagnosticTree)
    let snapshots = app.staticTexts.matching(identifier: "AgoraWeave").allElementsBoundByIndex
    let leaves = snapshots.filter { $0.descendants(matching: .staticText).matching(identifier: "AgoraWeave").count == 0 }
    XCTAssertEqual(leaves.count, 1)
    let title = try XCTUnwrap(leaves.first)
    for snapshot in snapshots {
      XCTAssertEqual(snapshot.label, title.label)
      XCTAssertEqual(snapshot.frame.minX, title.frame.minX, accuracy: 1)
      XCTAssertEqual(snapshot.frame.minY, title.frame.minY, accuracy: 1)
      XCTAssertEqual(snapshot.frame.width, title.frame.width, accuracy: 1)
      XCTAssertEqual(snapshot.frame.height, title.frame.height, accuracy: 1)
    }
    XCTAssertTrue(title.isEnabled)
    let window = app.windows.firstMatch.frame
    let top = max(window.minY + 24, app.statusBars.firstMatch.exists ? app.statusBars.firstMatch.frame.maxY : 0)
    let viewport = CGRect(x: window.minX, y: top, width: window.width, height: window.maxY - top - 24)
    XCTAssertTrue(viewport.contains(title.frame))
    let interactive = app.buttons.count + app.switches.count + app.sliders.count
    let editable = app.textFields.count + app.secureTextFields.count + app.textViews.count
    XCTAssertEqual(interactive, 0)
    XCTAssertEqual(editable, 0)
    var audit: [String: Any]
    if #available(iOS 17.0, *) {
      try app.performAccessibilityAudit()
      audit = ["method": "xctest-system-audit", "executed": true, "issues": []]
    } else {
      audit = ["method": "unavailable-before-ios17", "executed": false, "decision_ref": "ED-14", "issues": []]
    }
    let tree = app.debugDescription
    let treeAttachment = XCTAttachment(string: tree)
    treeAttachment.name = "bootstrap-accessibility-tree"
    treeAttachment.lifetime = .keepAlways
    add(treeAttachment)
    let pixels = screenshot.image.cgImage!
    var rgba = [UInt8](repeating: 0, count: 4)
    rgba.withUnsafeMutableBytes { bytes in
      let context = CGContext(data: bytes.baseAddress, width: 1, height: 1, bitsPerComponent: 8, bytesPerRow: 4,
        space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
      context.translateBy(x: -CGFloat(pixels.width / 2), y: -CGFloat(pixels.height / 4))
      context.draw(pixels, in: CGRect(x: 0, y: 0, width: CGFloat(pixels.width), height: CGFloat(pixels.height)))
    }
    let light = rgba.prefix(3).allSatisfy { abs(Int($0) - 255) <= 3 }
    let dark = abs(Int(rgba[0]) - 17) <= 3 && abs(Int(rgba[1]) - 17) <= 3 && abs(Int(rgba[2]) - 19) <= 3
    XCTAssertTrue(light || dark, "Actual shell background must match an expected theme")
    func rect(_ value: CGRect) -> [String: CGFloat] { ["x": value.minX, "y": value.minY, "width": value.width, "height": value.height] }
    func hash(_ bytes: Data) -> String { SHA256.hash(data: bytes).map { String(format: "%02x", $0) }.joined() }
    let measurement: [String: Any] = ["theme": light ? "light" : "dark", "font_scale": UIFontMetrics.default.scaledValue(for: 17) / 17,
      "title": title.label, "role": "staticText", "enabled": title.isEnabled, "title_count": leaves.count,
      "title_snapshot_count": snapshots.count, "title_container_count": snapshots.count - leaves.count,
      "interactive_count": interactive, "editable_count": editable, "frame": rect(title.frame), "viewport": rect(viewport),
      "background_rgb": Array(rgba.prefix(3)), "audit": audit, "tree_sha256": hash(Data(tree.utf8)), "screenshot_sha256": hash(screenshot.pngRepresentation)]
    let attachment = XCTAttachment(data: try JSONSerialization.data(withJSONObject: ["source": "native-xctest", "measurement": measurement], options: [.sortedKeys]), uniformTypeIdentifier: "public.json")
    attachment.name = "bootstrap-accessibility"
    attachment.lifetime = .keepAlways
    add(attachment)
  }

  private func verifyHTTPS(_ configURL: URL) throws {
    let config = try JSONSerialization.jsonObject(with: Data(contentsOf: configURL)) as! [String: Any]
    let session = URLSession(configuration: .ephemeral, delegate: HTTPSRedirectRefusal(), delegateQueue: nil)
    defer { session.invalidateAndCancel() }
    var environments: [[String: Any]] = []
    for environment in ["dev", "test"] {
      let values = config[environment] as! [String: Any]
      let base = values["url"] as! String
      let token = values["token"] as! String
      func request(_ route: String, _ credential: String?) throws -> (Int, Data) {
        var request = URLRequest(url: URL(string: base + route)!)
        request.timeoutInterval = 15
        if let credential = credential { request.setValue("Bearer " + credential, forHTTPHeaderField: "Authorization") }
        let done = expectation(description: "Native HTTPS response")
        var actual: (Int, Data)?, failure: Error?
        session.dataTask(with: request) { bytes, response, error in
          failure = error
          if let response = response as? HTTPURLResponse { actual = (response.statusCode, bytes ?? Data()) }
          done.fulfill()
        }.resume()
        wait(for: [done], timeout: 20)
        if let failure = failure { throw failure }
        XCTAssertNotNil(actual)
        return actual!
      }
      let accepted = try request("/auth/v1/health", token)
      XCTAssertEqual(accepted.0, 200)
      let body = try JSONSerialization.jsonObject(with: accepted.1) as! [String: Any]
      XCTAssertEqual(body["name"] as? String, "GoTrue")
      let anonymous = try request("/auth/v1/health", nil).0
      let other = try request("/auth/v1/health", values["other_token"] as? String).0
      let privatePath = try request("/auth/v1/admin", token).0
      XCTAssertEqual(anonymous, 401)
      XCTAssertEqual(other, 401)
      XCTAssertEqual(privatePath, 404)
      environments.append(["environment": environment, "accepted": accepted.0, "anonymous": anonymous,
        "other_environment": other, "private_path": privatePath,
        "body_sha256": SHA256.hash(data: accepted.1).map { String(format: "%02x", $0) }.joined()])
    }
    let report: [String: Any] = ["state": "passed", "source": "native-xctest-urlsession", "run_id": config["run_id"]!,
      "attempt": config["attempt"]!, "target_sha": config["target_sha"]!, "environments": environments]
    let attachment = XCTAttachment(data: try JSONSerialization.data(withJSONObject: report, options: [.sortedKeys]), uniformTypeIdentifier: "public.json")
    attachment.name = "bootstrap-https"
    attachment.lifetime = .keepAlways
    add(attachment)
  }
}
