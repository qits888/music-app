# 音乐播放器

现代化的音乐播放器，支持网页版和安卓版。

## 功能特性

### 核心功能
- ✅ 完整的音频播放控制（播放/暂停/上一首/下一首）
- ✅ 进度条拖拽和音量控制
- ✅ 播放模式切换（顺序/随机/单曲循环）
- ✅ 播放列表管理
- ✅ 音乐库分类浏览
- ✅ **内置歌曲配置**（预配置音频资源）
- ✅ LRC歌词解析和同步显示
- ✅ 实时搜索功能
- ✅ 音频频谱可视化

### UI特性
- 🎨 现代简约设计风格
- 📱 移动优先响应式布局
- 🌙 深色主题
- ✨ 磨砂玻璃效果
- 🎭 流畅动画过渡
- ♿ 无障碍访问支持

## 技术栈

- **前端**: 原生 HTML5 + CSS3 + ES6+ JavaScript
- **架构**: 函数式编程 + 事件驱动
- **音频**: Web Audio API
- **存储**: LocalStorage
- **安卓**: WebView

## 项目结构

```
web/
├── index.html              # 入口页面
├── styles/                 # 样式文件
│   ├── reset.css          # 样式重置
│   ├── variables.css      # CSS变量
│   ├── layout.css         # 布局系统
│   ├── components.css     # 组件样式
│   └── responsive.css     # 响应式
├── scripts/               # JavaScript模块
│   ├── core/              # 核心模块
│   │   ├── audio-engine.js
│   │   ├── state-manager.js
│   │   └── event-bus.js
│   ├── modules/           # 功能模块
│   │   ├── player.js
│   │   ├── playlist.js
│   │   ├── library.js
│   │   ├── lyrics.js
│   │   ├── search.js
│   │   └── visualizer.js
│   ├── utils/             # 工具函数
│   │   ├── dom.js
│   │   ├── format.js
│   │   └── storage.js
│   └── app.js             # 应用入口
└── assets/                # 资源文件
    ├── icons/
    └── demo-audio/
```

## 快速开始

### 网页版

⚠️ **重要**：由于使用ES6模块，必须通过HTTP服务器访问，不能直接双击HTML文件。

使用本地服务器：

```bash
# 使用Python
cd web
python -m http.server 8000

# 使用Node.js
npx serve web

# 使用PHP
cd web
php -S localhost:8000
```

然后访问 `http://localhost:8000`

### 安卓版

1. 使用 Android Studio 打开 `android/MusicApp` 目录
2. 构建并运行项目
3. 或直接安装打包好的 APK

## 使用说明

### 添加音乐

**内置歌曲配置方式**（v2.0）

1. **准备音频文件**
   - 将音频文件（MP3、WAV等）放到 `web/assets/audio/` 目录
   - 将封面图片（JPG、PNG）放到同一目录

2. **配置歌曲信息**
   - 编辑 `web/scripts/data/tracks.js` 文件
   - 按照格式添加歌曲配置：
   ```javascript
   {
       id: 'my-song-1',
       title: '歌曲名',
       artist: '艺术家',
       src: 'assets/audio/song.mp3',
       cover: 'assets/audio/cover.jpg',
       lyrics: `[00:00.00]歌词...`
   }
   ```

3. **刷新浏览器**
   - 按 `Ctrl+Shift+R` 强制刷新

详细说明请查看 [USAGE.md](web/USAGE.md)

### 播放控制

- 点击封面或卡片播放音乐
- 使用底部控制栏进行播放控制
- 拖动进度条跳转播放位置
- 点击模式按钮切换播放模式

### 查看歌词

- 歌词会自动加载（如果音轨包含歌词）
- 歌词随播放进度自动滚动高亮
- 点击歌词行可以跳转到对应位置

### 搜索音乐

1. 点击"搜索"标签
2. 输入歌曲名、艺术家或专辑名
3. 点击搜索结果即可播放

## 架构设计

### 核心模块

**AudioEngine（音频引擎）**
- 封装 HTML5 Audio API
- 提供播放控制接口
- 集成 Web Audio API 用于频谱分析

**StateManager（状态管理器）**
- 集中管理应用状态
- 发布状态变更事件
- 提供状态读写接口

**EventBus（事件总线）**
- 模块间解耦通信
- 支持订阅/发布模式
- 事件错误隔离

### 数据流

```
用户交互 → EventBus → StateManager → AudioEngine
              ↓             ↓
          UI更新    ←   状态变更通知
```

### 状态机

播放器状态：idle → loading → ready → playing ⇄ paused

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器（iOS Safari 14+, Chrome Mobile 90+）

## 性能优化

- 虚拟滚动处理长列表
- requestAnimationFrame 优化动画
- 防抖/节流处理用户输入
- 图片懒加载
- LocalStorage 数据持久化

## 未来计划

- [ ] 管理界面：添加/编辑/删除歌曲
- [ ] 云端同步（需后端支持）
- [ ] 用户系统和个性化推荐
- [ ] 播放历史和统计
- [ ] 均衡器
- [ ] 音效增强
- [ ] 导入/导出播放列表
- [ ] 深色/浅色主题切换
- [ ] 多语言支持

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！