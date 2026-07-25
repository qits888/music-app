# 音乐播放器 - 使用指南（更新版）

## ⚠️ 重要变更

**v2.0 - 内置歌曲模式**
- ✅ 已移除"添加本地文件"和"添加URL"功能
- ✅ 改为使用 `assets/audio/` 目录下的内置歌曲
- ✅ 所有歌曲需要预先配置在 `scripts/data/tracks.js`

## 📦 快速开始

### 1. 准备音频文件

将你的音频文件和封面放到 `web/assets/audio/` 目录：

```
web/assets/audio/
├── song1.mp3
├── song2.mp3
├── song3.mp3
├── cover1.jpg
├── cover2.jpg
└── cover3.jpg
```

### 2. 配置歌曲信息

编辑 `web/scripts/data/tracks.js`，添加歌曲配置：

```javascript
export const builtInTracks = [
    {
        id: 'track-1',
        title: '你的歌曲名',
        artist: '艺术家',
        album: '专辑',
        src: 'assets/audio/song1.mp3',
        cover: 'assets/audio/cover1.jpg',
        lyrics: `[00:00.00]歌词第一行
[00:03.00]歌词第二行`
    },
    // 添加更多歌曲...
];
```

### 3. 启动应用

```powershell
cd "E:\项目\Music app\web"
python -m http.server 5000
```

访问：`http://localhost:5000`

## 🎵 添加歌曲步骤

### 完整示例

1. **准备文件**
   - 音频：`我的歌曲.mp3`
   - 封面：`我的封面.jpg`（可选）

2. **复制到目录**
   ```powershell
   Copy-Item "你的歌曲.mp3" "web\assets\audio\"
   Copy-Item "你的封面.jpg" "web\assets\audio\"
   ```

3. **编辑配置**
   打开 `web/scripts/data/tracks.js`，添加：
   ```javascript
   {
       id: 'my-song-1',  // 唯一ID
       title: '我的歌曲',
       artist: '我',
       src: 'assets/audio/我的歌曲.mp3',
       cover: 'assets/audio/我的封面.jpg',
       lyrics: `[00:00.00]可选的歌词`
   }
   ```

4. **刷新浏览器**
   按 `Ctrl+Shift+R` 强制刷新缓存

## 📝 歌词格式

使用标准LRC格式：

```
[00:00.00]第一句歌词
[00:05.20]第二句歌词
[00:10.50]第三句歌词
```

- 时间格式：`[分:秒.毫秒]`
- 每行一句歌词

## 🎨 封面图片建议

- **格式**：JPG、PNG、WebP
- **尺寸**：500x500 或更大（正方形）
- **大小**：建议 < 500KB

## ⚡ 故障排查

### 歌曲不显示？
1. 检查文件路径是否正确
2. 确认文件确实存在于 `assets/audio/` 目录
3. 查看浏览器控制台（F12）是否有错误

### 无法播放？
1. 确认音频格式被浏览器支持（推荐MP3）
2. 检查文件是否损坏
3. 查看控制台错误信息

### 封面不显示？
1. 检查图片路径
2. 确认图片格式正确
3. 可以留空 `cover: ''` 使用占位符

## 🔄 与旧版本的区别

### 旧版本（v1.0）
- ✗ 用户可以添加本地文件
- ✗ 用户可以添加URL
- ✓ 需要每次手动添加

### 新版本（v2.0）
- ✓ 预配置内置歌曲
- ✓ 统一管理音频资源
- ✓ 更适合发布和分享
- ✗ 用户无法自行添加歌曲

## 📂 目录结构

```
Music app/
└── web/
    ├── assets/
    │   └── audio/              # 音频资源目录
    │       ├── song1.mp3
    │       ├── cover1.jpg
    │       └── README.md
    └── scripts/
        └── data/
            └── tracks.js       # 歌曲配置文件
```

## 💡 提示

- 所有歌曲会自动加载到播放列表
- 支持搜索、分类、收藏等功能
- 歌词会自动同步显示
- 播放历史会自动记录

## 🎯 推荐工作流

1. 收集所有音频文件
2. 统一命名（如 song1.mp3, song2.mp3）
3. 批量复制到 `assets/audio/`
4. 一次性配置所有歌曲到 `tracks.js`
5. 测试和调整