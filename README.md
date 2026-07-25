# 音乐播放器 Web App

一个功能完整的网页音乐播放器，支持歌词显示、播放列表、搜索等功能。

## ✨ 特性

- 🎵 音频播放控制（播放/暂停/上一曲/下一曲/进度条）
- 📝 实时歌词显示与同步
- 📚 音乐库管理和分类
- 🔍 歌曲搜索功能
- 📱 响应式设计，支持手机和电脑
- 🎨 可视化音频效果
- 📋 播放列表管理
- ☁️ **支持远程服务器播放**（可将音频文件部署到云端）

## 🚀 快速开始

### 音频文件部署方式

本项目支持两种音频部署方式：

**方式1：本地部署**（快速测试）
- 音频文件存储在本地 `web/assets/audio/` 目录
- 适合本地开发和测试

**方式2：远程服务器部署**（推荐生产使用）
- 音频文件部署到云存储或自建服务器
- 支持CDN加速，播放更流畅
- 减少应用体积，节省存储空间
- 详细配置请参考：[音频服务器部署指南.md](音频服务器部署指南.md)

### 网页版

1. 克隆仓库
```bash
git clone https://github.com/你的用户名/仓库名.git
```

2. 添加音频文件
将你的音乐文件放入 `web/assets/audio/` 目录，按以下结构组织：

```
web/assets/audio/
├── 分类名1/
│   ├── 歌曲名1/
│   │   ├── 歌曲名1.mp3 (或 .wav)
│   │   ├── 歌曲名1.lrc (歌词文件)
│   │   ├── 歌曲名1.png (封面图片)
│   │   └── 歌曲名1.txt (歌词文本)
│   └── 歌曲名2/
│       └── ...
└── 分类名2/
    └── ...
```

3. 打开网页
直接用浏览器打开 `web/index.html` 即可使用。

### Android版

本项目支持打包为Android应用，使用GitHub Actions自动构建。

#### 自动构建步骤

1. 确保音频文件已添加到 `web/assets/audio/` 目录
2. 推送代码到GitHub
3. GitHub Actions会自动构建APK
4. 在Actions页面下载构建好的APK

详细步骤请参考：[新手GitHub操作指南.md](新手GitHub操作指南.md)

#### 本地构建（可选）

如果安装了Android Studio或Android SDK：

```bash
cd android/MusicApp
./gradlew assembleDebug  # Linux/Mac
gradlew.bat assembleDebug  # Windows
```

APK位置：`android/MusicApp/app/build/outputs/apk/debug/app-debug.apk`

## 📁 项目结构

```
.
├── web/                      # 网页版源码
│   ├── index.html           # 主页面
│   ├── styles/              # 样式文件
│   ├── scripts/             # JavaScript代码
│   │   ├── core/           # 核心模块
│   │   ├── modules/        # 功能模块
│   │   └── utils/          # 工具函数
│   └── assets/
│       └── audio/          # 音频资源（.gitignore已排除）
├── android/                 # Android项目
│   └── MusicApp/           # Android应用源码
├── .github/
│   └── workflows/          # GitHub Actions配置
└── README.md               # 项目说明
```

## 📝 注意事项

### 音频文件说明

⚠️ **音频文件不包含在仓库中**

由于版权和仓库大小限制，音频文件（.mp3, .wav等）、封面图片和歌词文件不会上传到GitHub。

**使用方式**：

**本地使用**：
1. 克隆仓库后
2. 手动将你的音乐文件添加到 `web/assets/audio/` 目录
3. 按照上述目录结构组织文件

**远程服务器使用**（推荐）：
1. 将音频文件上传到云存储服务（阿里云OSS、腾讯云COS等）
2. 配置 `web/scripts/config.js` 文件设置服务器地址
3. 应用会自动从服务器加载音频
4. 详细步骤请查看：[音频服务器部署指南.md](音频服务器部署指南.md)

### 歌词文件格式

支持 `.lrc` 格式的歌词文件，格式示例：

```
[00:12.50]第一句歌词
[00:18.20]第二句歌词
```

## 🛠️ 技术栈

- **前端**：原生 HTML5 + CSS3 + JavaScript (ES6+)
- **音频处理**：Web Audio API
- **Android**：WebView混合应用
- **CI/CD**：GitHub Actions

## 📱 系统要求

- **网页版**：现代浏览器（Chrome, Firefox, Safari, Edge）
- **Android版**：Android 5.0 (API 21) 或更高版本

## 📚 相关文档

- [新手GitHub操作指南](新手GitHub操作指南.md) - 从零开始使用GitHub
- [快速操作卡片](快速操作卡片.md) - 常用命令速查
- [Android构建指南](android/ANDROID_BUILD.md) - Android详细构建说明
- [GitHub构建指南](GITHUB_BUILD_GUIDE.md) - 使用GitHub Actions构建

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

本项目仅供学习交流使用。

## ⚖️ 版权声明

请确保你添加的音频文件拥有合法的使用权限，不要侵犯版权。

---

**提示**：首次使用请阅读 [新手GitHub操作指南.md](新手GitHub操作指南.md)