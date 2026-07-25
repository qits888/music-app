# 安卓应用构建指南

## 项目结构

安卓项目已创建在 `android/MusicApp/` 目录下，采用 WebView 混合应用架构。

## 准备工作

### 1. 复制网页资源到安卓项目

需要将网页版的所有文件复制到安卓项目的 assets 目录：

**Windows PowerShell:**
```powershell
# 从项目根目录执行
Copy-Item -Path "web\*" -Destination "android\MusicApp\app\src\main\assets\web\" -Recurse -Force
```

**Linux/Mac:**
```bash
# 从项目根目录执行
cp -r web/* android/MusicApp/app/src/main/assets/web/
```

### 2. 安装 Android Studio

下载并安装 [Android Studio](https://developer.android.com/studio)

## 构建步骤

### 使用 Android Studio

1. 打开 Android Studio
2. 选择 "Open an Existing Project"
3. 导航到 `android/MusicApp` 目录并打开
4. 等待 Gradle 同步完成
5. 连接安卓设备或启动模拟器
6. 点击 "Run" 按钮或按 `Shift+F10`

### 使用命令行

```bash
cd android/MusicApp

# 构建调试版本
./gradlew assembleDebug

# 构建发布版本
./gradlew assembleRelease

# 安装到设备
./gradlew installDebug
```

生成的 APK 位于：
- 调试版本: `app/build/outputs/apk/debug/app-debug.apk`
- 发布版本: `app/build/outputs/apk/release/app-release.apk`

## 项目配置

### 核心文件说明

**AndroidManifest.xml**
- 配置应用权限（网络、存储、音频）
- 定义应用入口 Activity

**MainActivity.java**
- WebView 容器主 Activity
- 配置 WebView 设置（JavaScript、DOM 存储、媒体播放）
- 加载本地 HTML 文件

**build.gradle**
- 项目构建配置
- 最低 SDK 版本：21 (Android 5.0)
- 目标 SDK 版本：33

**styles.xml**
- 应用主题配置
- 状态栏和导航栏颜色

## 权限说明

应用需要以下权限：

- `INTERNET` - 加载在线音频
- `ACCESS_NETWORK_STATE` - 检查网络状态
- `READ_EXTERNAL_STORAGE` - 读取本地音频文件
- `WRITE_EXTERNAL_STORAGE` - 保存数据
- `MODIFY_AUDIO_SETTINGS` - 音频设置控制

## 常见问题

### Q: WebView 无法播放音频？
A: 确保已设置 `setMediaPlaybackRequiresUserGesture(false)`

### Q: 本地文件无法加载？
A: 检查 assets 目录中是否包含完整的 web 资源

### Q: 返回键不工作？
A: MainActivity 已重写 `onBackPressed()` 实现 WebView 历史导航

### Q: 如何启用调试？
A: 在 MainActivity 中添加：
```java
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
    WebView.setWebContentsDebuggingEnabled(true);
}
```

然后在 Chrome 浏览器访问 `chrome://inspect` 进行远程调试

## 发布准备

### 1. 签名配置

创建 keystore：
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

在 `app/build.gradle` 中配置签名：
```gradle
android {
    signingConfigs {
        release {
            storeFile file("my-release-key.jks")
            storePassword "your-password"
            keyAlias "my-key-alias"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 2. 混淆配置

在 `app/proguard-rules.pro` 中添加：
```
-keep class android.webkit.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
```

### 3. 图标和启动画面

- 替换 `res/mipmap-*/ic_launcher.png` 为自定义图标
- 添加启动画面（可选）

### 4. 优化 APK 大小

- 启用代码混淆
- 移除未使用的资源
- 启用 APK 分包（如果需要）

## 后续优化

可以考虑添加：

1. **原生文件选择器**
   - 使用 Android 原生文件选择器替代 Web File API
   
2. **后台播放**
   - 实现 MediaSession 和通知栏控制
   
3. **离线缓存**
   - 缓存音频文件到本地存储
   
4. **JS 桥接**
   - 添加 `@JavascriptInterface` 方法实现原生功能调用

示例 JS 桥接：
```java
// 在 MainActivity 中
webView.addJavascriptInterface(new WebAppInterface(this), "Android");

class WebAppInterface {
    Context context;
    
    WebAppInterface(Context c) {
        context = c;
    }
    
    @JavascriptInterface
    public void showToast(String toast) {
        Toast.makeText(context, toast, Toast.LENGTH_SHORT).show();
    }
}
```

在 JavaScript 中调用：
```javascript
if (window.Android) {
    Android.showToast('Hello from WebView!');
}
```

## 测试

建议在以下设备/系统上测试：

- Android 5.0 (最低支持版本)
- Android 8.0 (常见版本)
- Android 11+ (最新特性)
- 不同屏幕尺寸（手机、平板）
- 不同厂商 ROM（小米、华为、OPPO等）