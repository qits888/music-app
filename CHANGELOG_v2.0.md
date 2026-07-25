# 更新日志 - v2.0 内置歌曲模式

## 📅 更新时间
2026年7月25日

## 🎯 主要变更

### 1. 移除功能
- ❌ 删除"添加本地文件"按钮和功能
- ❌ 删除"添加URL"按钮和功能
- ❌ 删除文件选择器 (`<input type="file">`)
- ❌ 移除 `handleFileSelect()` 函数
- ❌ 移除 `addTrackByUrl()` 函数

### 2. 新增功能
- ✅ 内置歌曲配置系统 (`scripts/data/tracks.js`)
- ✅ 自动加载 `assets/audio/` 目录下的音频文件
- ✅ 支持 txt 格式歌词文件自动加载
- ✅ 歌词文件路径配置 (`lyricsUrl`)

### 3. 修改的文件

**前端核心文件**：
1. `web/index.html` - 删除添加按钮和文件上传控件
2. `web/scripts/modules/library.js` - 移除文件和URL添加逻辑
3. `web/scripts/modules/lyrics.js` - 支持txt格式歌词加载
4. `web/scripts/app.js` - 改用内置歌曲数据

**新增文件**：
1. `web/scripts/data/tracks.js` - 歌曲配置文件
2. `web/scripts/utils/lyrics-helper.js` - 歌词转换辅助工具
3. `web/USAGE.md` - 详细使用说明
4. `web/assets/audio/README.md` - 音频目录说明

**文档更新**：
1. `README.md` - 更新功能说明
2. `GET_STARTED.md` - 更新使用方法

## 📂 当前歌曲配置

已配置的4首歌曲：
1. **今天为你点亮** - WAV格式
2. **魅力隆回** - WAV格式
3. **宝贝你慢慢长大** - MP3格式
4. **不是终点** - WAV格式

所有歌曲都包含：
- ✅ 音频文件
- ✅ 封面图片
- ✅ 歌词文本（.txt格式）

## 🎵 歌曲配置示例

在 `web/scripts/data/tracks.js` 中：

```javascript
{
    id: 'track-1',
    title: '今天为你点亮',
    artist: '未知',
    album: '粤语精选',
    src: 'assets/audio/粤语歌曲/今天为你点亮/今天为你点亮.wav',
    cover: 'assets/audio/粤语歌曲/今天为你点亮/今天为你点亮.png',
    lyricsUrl: 'assets/audio/粤语歌曲/今天为你点亮/今天为你点亮.txt'
}
```

## 🔧 如何添加新歌曲

### 步骤1：准备文件
```
web/assets/audio/
└── 你的歌曲目录/
    ├── 歌曲.mp3
    ├── 封面.jpg
    └── 歌词.txt
```

### 步骤2：编辑配置
打开 `web/scripts/data/tracks.js`，添加：
```javascript
{
    id: 'new-song',
    title: '歌曲名',
    artist: '艺术家',
    src: 'assets/audio/你的歌曲目录/歌曲.mp3',
    cover: 'assets/audio/你的歌曲目录/封面.jpg',
    lyricsUrl: 'assets/audio/你的歌曲目录/歌词.txt'
}
```

### 步骤3：刷新浏览器
按 `Ctrl+Shift+R` 强制刷新缓存

## 📝 歌词格式说明

### 支持的格式

**1. LRC格式（推荐 - 支持时间同步）**
```
[00:00.00]第一行歌词
[00:05.20]第二行歌词
[00:10.50]第三行歌词
```

**2. 纯文本格式（当前使用）**
```
第一行歌词
第二行歌词
第三行歌词
```
> 注意：txt格式会显示歌词，但不会自动滚动同步

### 转换工具

如需将txt转为LRC格式，可以使用：
- 在线工具：[LRC歌词编辑器](https://lrc-maker.github.io/)
- 或使用 `scripts/utils/lyrics-helper.js` 中的转换函数

## 🎨 优势对比

### v1.0（旧版 - 用户添加）
- ✓ 用户可自由添加音乐
- ✓ 支持本地文件和URL
- ✗ 需要每次手动添加
- ✗ 难以预配置和分享
- ✗ 不适合发布部署

### v2.0（新版 - 内置配置）
- ✓ 预配置好所有歌曲
- ✓ 统一管理资源
- ✓ 适合发布和分享
- ✓ 易于维护和更新
- ✗ 用户无法自行添加

## 🚀 启动方式（无变化）

```powershell
cd "E:\项目\Music app\web"
python -m http.server 5000
# 访问 http://localhost:5000
```

## ✅ 测试清单

- [x] 删除添加本地文件按钮
- [x] 删除添加URL按钮
- [x] 配置4首内置歌曲
- [x] 测试歌曲播放
- [x] 测试封面显示
- [x] 测试歌词加载
- [x] 更新文档说明
- [x] 服务器正常运行

## 📞 后续建议

1. **歌词优化**：将txt歌词转换为LRC格式，实现时间同步
2. **艺术家信息**：更新track配置中的artist字段为真实艺术家
3. **专辑分类**：按专辑或类型组织歌曲
4. **更多歌曲**：继续添加更多内置歌曲

## 🔗 相关文档

- [USAGE.md](web/USAGE.md) - 详细使用指南
- [assets/audio/README.md](web/assets/audio/README.md) - 音频目录说明
- [README.md](README.md) - 项目总体说明