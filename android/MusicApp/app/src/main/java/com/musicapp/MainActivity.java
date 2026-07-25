package com.musicapp;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    
    private WebView webView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        webView = findViewById(R.id.webview);
        setupWebView();
        
        // 加载本地HTML文件
        webView.loadUrl("file:///android_asset/web/index.html");
    }
    
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        
        // 启用JavaScript
        settings.setJavaScriptEnabled(true);
        
        // 启用DOM存储
        settings.setDomStorageEnabled(true);
        
        // 启用数据库
        settings.setDatabaseEnabled(true);
        
        // 允许自动播放媒体
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        // 启用缓存
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAppCacheEnabled(true);
        
        // 允许文件访问
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // 支持缩放
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        
        // 自适应屏幕
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        
        // 设置WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });
        
        // 设置WebChromeClient（支持全屏等功能）
        webView.setWebChromeClient(new WebChromeClient());
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}