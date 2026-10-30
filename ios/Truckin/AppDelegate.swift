import UIKit
import AVFAudio

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // .playback (not .ambient) so the game is audible with the iPhone's silent switch on; mixWithOthers keeps the player's own music playing.
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
        try? AVAudioSession.sharedInstance().setActive(true)
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = GameViewController()
        window.makeKeyAndVisible()
        self.window = window
        return true
    }
    func applicationWillResignActive(_ application: UIApplication) {
        (window?.rootViewController as? GameViewController)?.pauseGame()
    }
    func applicationDidEnterBackground(_ application: UIApplication) {
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
    func applicationDidBecomeActive(_ application: UIApplication) {
        try? AVAudioSession.sharedInstance().setActive(true)
    }
}
