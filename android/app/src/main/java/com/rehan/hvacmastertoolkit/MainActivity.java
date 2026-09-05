package com.rehan.hvacmastertoolkit;

import android.os.Bundle;
import android.content.SharedPreferences;
import android.webkit.WebStorage;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        SharedPreferences prefs = getSharedPreferences("app_prefs", MODE_PRIVATE);
        int savedVersion = prefs.getInt("last_version_code", -1);
        int currentVersion = BuildConfig.VERSION_CODE;

        if (savedVersion != currentVersion) {
            final WebView webView = getBridge().getWebView();

            // WebView ka HTTP cache clear karo
            webView.clearCache(true);
            webView.clearHistory();

            // localStorage, IndexedDB, WebSQL sab clear karo
            WebStorage.getInstance().deleteAllData();

            // Naya version number save kar do
            prefs.edit()
                 .putInt("last_version_code", currentVersion)
                 .apply();

            // Service Worker unregister karo aur uska Cache Storage bhi delete karo
            webView.post(new Runnable() {
                @Override
                public void run() {
                    String jsCode =
                        "if ('serviceWorker' in navigator) {" +
                        "  navigator.serviceWorker.getRegistrations().then(function(registrations) {" +
                        "    for (let registration of registrations) { registration.unregister(); }" +
                        "  });" +
                        "}" +
                        "if ('caches' in window) {" +
                        "  caches.keys().then(function(names) {" +
                        "    for (let name of names) { caches.delete(name); }" +
                        "  });" +
                        "}";

                    webView.evaluateJavascript(jsCode, null);

                    // Thoda delay dekar reload karo taaki JS execute ho jaye
                    webView.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            webView.reload();
                        }
                    }, 500);
                }
            });
        }
    }
}