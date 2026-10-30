import UIKit
import WebKit
import GameKit

final class GameViewController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate, GKGameCenterControllerDelegate {
    private var webView: WKWebView!
    private let progressKey = "truckin-progress-v1"
    private let pendingKey = "truckin-pending-gamecenter"
    private var authenticating = false
    private var submitting = false
    private var wantsLeaderboard = false
    private let allTimeID = "truckin.earnings"
    private let dailyID = "truckin.daily"
    override var prefersStatusBarHidden: Bool { true }
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge { [.bottom, .left, .right] }
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .portrait }
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.08, green: 0.17, blue: 0.18, alpha: 1)
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.userContentController.add(self, name: "truckin")
        if let progress = UserDefaults.standard.string(forKey: progressKey),
           let data = try? JSONSerialization.data(withJSONObject: [progress]),
           let json = String(data: data, encoding: .utf8) {
            let source = "try { if (!localStorage.getItem('truckin-save-v1')) localStorage.setItem('truckin-save-v1', (\(json))[0]); } catch(e) {}"
            configuration.userContentController.addUserScript(WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.isOpaque = false
        webView.backgroundColor = view.backgroundColor
        webView.scrollView.backgroundColor = view.backgroundColor
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.navigationDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        if #available(iOS 16.4, *) {
            #if DEBUG
            webView.isInspectable = true
            #endif
        }
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
        loadGame()
    }
    private func loadGame() {
        guard let folder = Bundle.main.url(forResource: "web", withExtension: nil) else {
            showLoadError("The bundled game files are missing.")
            return
        }
        webView.loadFileURL(folder.appendingPathComponent("play.html"), allowingReadAccessTo: folder)
    }
    func pauseGame() {
        webView?.evaluateJavaScript("window.truckinNativeMessage && window.truckinNativeMessage('pause')", completionHandler: nil)
    }
    private func notify(_ message: String) {
        guard let data = try? JSONSerialization.data(withJSONObject: [message]),
              let json = String(data: data, encoding: .utf8) else { return }
        webView.evaluateJavaScript("window.truckinNativeMessage && window.truckinNativeMessage((\(json))[0])", completionHandler: nil)
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, message.frameInfo.request.url?.isFileURL == true,
              let body = message.body as? [String: Any], let action = body["action"] as? String else { return }
        switch action {
        case "haptic":
            UIImpactFeedbackGenerator(style: body["style"] as? String == "heavy" ? .heavy : .light).impactOccurred()
        case "saveProgress":
            if let data = body["data"] as? String, data.utf8.count < 500_000 {
                UserDefaults.standard.set(data, forKey: progressKey)
            }
        case "submitScore":
            guard let score = body["score"] as? Int, score > 0, score < 1_000_000 else { return }
            let mode = body["mode"] as? String == "daily" ? "daily" : "endless"
            var pending = UserDefaults.standard.array(forKey: pendingKey) as? [[String: Any]] ?? []
            pending.append(["score": score, "mode": mode, "date": ISO8601DateFormatter().string(from: Date())])
            UserDefaults.standard.set(Array(pending.suffix(30)), forKey: pendingKey)
            if GKLocalPlayer.local.isAuthenticated { flushScores() }
        case "leaderboard":
            pauseGame()
            wantsLeaderboard = true
            authenticate()
        case "share":
            guard let text = body["text"] as? String, text.count < 1000 else { return }
            let controller = UIActivityViewController(activityItems: [text], applicationActivities: nil)
            if let popover = controller.popoverPresentationController {
                popover.sourceView = view
                popover.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.maxY - 80, width: 1, height: 1)
            }
            present(controller, animated: true)
        default: break
        }
    }
    private func authenticate() {
        if GKLocalPlayer.local.isAuthenticated {
            flushScores()
            showLeaderboard()
            return
        }
        guard !authenticating else { return }
        authenticating = true
        GKLocalPlayer.local.authenticateHandler = { [weak self] controller, error in
            DispatchQueue.main.async {
                guard let self else { return }
                if let controller {
                    if self.presentedViewController == nil { self.present(controller, animated: true) }
                } else {
                    self.authenticating = false
                    if GKLocalPlayer.local.isAuthenticated {
                        self.flushScores()
                        if self.wantsLeaderboard { self.showLeaderboard() }
                    } else {
                        self.wantsLeaderboard = false
                        self.notify("gameCenterUnavailable")
                    }
                }
            }
        }
    }
    private func showLeaderboard() {
        guard presentedViewController == nil else { return }
        wantsLeaderboard = false
        let controller = GKGameCenterViewController(state: .leaderboards)
        controller.gameCenterDelegate = self
        present(controller, animated: true)
    }
    private func flushScores() {
        guard !submitting, GKLocalPlayer.local.isAuthenticated,
              let pending = UserDefaults.standard.array(forKey: pendingKey) as? [[String: Any]], !pending.isEmpty else { return }
        submitting = true
        let best = pending.compactMap { $0["score"] as? Int }.max() ?? 0
        let today = String(ISO8601DateFormatter().string(from: Date()).prefix(10))
        let daily = pending.filter { ($0["mode"] as? String) == "daily" && (($0["date"] as? String)?.hasPrefix(today) ?? false) }
            .compactMap { $0["score"] as? Int }.max()
        Task { @MainActor in
            defer { self.submitting = false }
            do {
                try await GKLeaderboard.submitScore(best, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [self.allTimeID])
                if let daily {
                    try await GKLeaderboard.submitScore(daily, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [self.dailyID])
                }
                var current = UserDefaults.standard.array(forKey: self.pendingKey) as? [[String: Any]] ?? []
                let dates = Set(pending.compactMap { $0["date"] as? String })
                current.removeAll { dates.contains($0["date"] as? String ?? "") }
                UserDefaults.standard.set(current, forKey: self.pendingKey)
                self.notify("scoreSubmitted")
            } catch {
                // Keep the queue for a later authentication or score submission.
            }
        }
    }
    func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) { loadGame() }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showLoadError("The game could not start. Your saved progress is kept.")
    }
    private func showLoadError(_ text: String) {
        let alert = UIAlertController(title: "Let’s try that again", message: text, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Reload game", style: .default) { [weak self] _ in self?.loadGame() })
        present(alert, animated: true)
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        decisionHandler(url.isFileURL || url.scheme == "about" ? .allow : .cancel)
    }
}
