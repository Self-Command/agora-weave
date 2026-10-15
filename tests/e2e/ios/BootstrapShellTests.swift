import XCTest
import CryptoKit

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
    let resume = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
    resume.name = "bootstrap-resume"
    resume.lifetime = .keepAlways
    add(resume)
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
