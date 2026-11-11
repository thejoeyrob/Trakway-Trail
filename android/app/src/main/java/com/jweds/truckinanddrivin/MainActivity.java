package com.jweds.truckinanddrivin;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler;
import androidx.webkit.WebViewClientCompat;

import org.json.JSONObject;

import java.util.Collections;

/**
 * Truckin' & Drivin' for Android: a full-screen WebView that serves the game's own files from the app (assets/web).
 * Nothing is loaded from the internet. The game talks to the phone through window.webkit.messageHandlers.truckin,
 * exactly like the iOS wrapper, so the web code has one native path for both platforms.
 */
public class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String START = ORIGIN + "/assets/web/play.html";
    /** Makes the web game's existing iOS bridge call into Android. Runs before any page script. */
    private static final String SHIM =
        "window.webkit=window.webkit||{};window.webkit.messageHandlers={truckin:{postMessage:function(m){TruckinAndroid.post(JSON.stringify(m));}}};";

    private WebView web;
    private long lastBack = 0;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(0xFF102326);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                    // saves, upgrades and settings live in localStorage
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new AssetsPathHandler(this))
            .build();

        web.addJavascriptInterface(new Bridge(), "TruckinAndroid");
        if (androidx.webkit.WebViewFeature.isFeatureSupported(androidx.webkit.WebViewFeature.DOCUMENT_START_SCRIPT)) {
            androidx.webkit.WebViewCompat.addDocumentStartJavaScript(web, SHIM, Collections.singleton(ORIGIN));
        }

        web.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                // Fallback for WebViews without document-start scripts.
                view.evaluateJavascript(SHIM, null);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (ORIGIN.equals(u.getScheme() + "://" + u.getHost())) return false;
                return true; // the game never needs to leave itself
            }
        });

        if (state == null) web.loadUrl(START); else web.restoreState(state);
        hideBars();
    }

    private void hideBars() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if (hasFocus) hideBars(); }

    @Override protected void onPause() {
        // Pause the shift when the player leaves the app (calls, home button, app switcher).
        if (web != null) { web.evaluateJavascript("window.truckinNativeMessage&&truckinNativeMessage('pause')", null); web.onPause(); }
        super.onPause();
    }

    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); hideBars(); }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); if (web != null) web.saveState(out); }

    @Override protected void onDestroy() { if (web != null) { web.removeJavascriptInterface("TruckinAndroid"); web.destroy(); web = null; } super.onDestroy(); }

    /** Back = Escape in the game (closes a panel or pauses). Press twice quickly on the depot screen to exit. */
    @SuppressWarnings("deprecation")
    @Override public void onBackPressed() {
        long now = System.currentTimeMillis();
        if (now - lastBack < 1800) { super.onBackPressed(); return; }
        lastBack = now;
        if (web != null) web.evaluateJavascript("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))", null);
        Toast.makeText(this, "Press back again to exit", Toast.LENGTH_SHORT).show();
    }

    /** Messages from the game's native bridge (same actions as the iOS wrapper). */
    private class Bridge {
        @JavascriptInterface
        public void post(String json) {
            try {
                JSONObject m = new JSONObject(json);
                switch (m.optString("action")) {
                    case "haptic": runOnUiThread(() -> buzz(m.optString("style", "light"))); break;
                    case "share": share(m.optString("text")); break;
                    case "leaderboard": case "submitScore":
                        // No platform leaderboard yet: show the player's own best shift.
                        if ("leaderboard".equals(m.optString("action")))
                            runOnUiThread(() -> web.evaluateJavascript("window.truckinNativeMessage&&truckinNativeMessage('gameCenterUnavailable')", null));
                        break;
                    default: break; // saveProgress etc.: the game keeps its own save in localStorage
                }
            } catch (Exception ignored) { }
        }
    }

    private void buzz(String style) {
        Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        if (v == null || !v.hasVibrator()) return;
        long ms = "heavy".equals(style) ? 40 : 14;
        if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
        else v.vibrate(ms);
    }

    private void share(String text) {
        Intent send = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text);
        startActivity(Intent.createChooser(send, "Share your shift"));
    }
}
