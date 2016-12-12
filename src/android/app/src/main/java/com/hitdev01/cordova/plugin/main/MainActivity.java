package com.hitdev01.cordova.plugin.main;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;

import org.apache.cordova.CordovaActivity;
import org.apache.cordova.CordovaWebView;

import java.util.concurrent.ArrayBlockingQueue;

public class MainActivity extends CordovaActivity {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Display "app/assets/www/index.html" on Cordova webview
        super.loadUrl("file:///android_asset/www/index.html");
    }

}
