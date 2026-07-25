# 歌曲分类系统说明

## 📋 概述

音乐播放器已支持歌曲分类功能，可以按不同类别组织和浏览你的音乐库。

## 🎵 当前分类

根据你的音频文件，已配置以下分类：

1. **🎵 全部** - 显示所有歌曲
2. **🎤 粤语歌曲** - 粤语歌曲专辑
3. **💝 治愈歌曲** - 治愈系列歌曲
4. **🕐 最近播放** - 最近播放的歌曲记录
5. **❤️ 我的收藏** - 收藏的歌曲

## 🔧 如何添加新分类

### 1. 修改分类定义

编辑 `web/scripts/data/tracks.js`，在 `categories` 数组中添加：

```javascript
export const categories = [
    { id: 'all', name: '全部', icon: '🎵' },
    { id: '粤语歌曲', name: '粤语歌曲', icon: '🎤' },
    { id: '治愈歌曲', name: '治愈歌曲', icon: '💝' },
    { id: '流行歌曲', name: '流行歌曲', icon: '🎼' },  // 新增分类
    { id: 'recent', name: '最近播放', icon: '🕐' },
    { id: 'favorite', name: '我的收藏', icon: '❤️' }
];
```

### 2. 为歌曲指定分类

在歌曲配置中添加 `category` 字段：

```javascript
{
    id: 'track-5',
    title: '新歌曲',
    artist: '艺术家',
    category: '流行歌曲',  // 指定分类
    src: 'assets/audio/...',
    cover: 'assets/audio/...'
}
```

### 3. 刷新浏览器

按 `Ctrl+Shift+R` 强制刷新，新分类标签会自动出现。

## 📊 分类字段说明

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | String | 分类唯一标识（必填） | `'流行歌曲'` |
| `name` | String | 分类显示名称（必填） | `'流行歌曲'` |
| `icon` | String | 分类图标（可选） | `'🎼'` |

## 🎨 分类特性

### 自动筛选
- 点击分类标签，音乐库会自动筛选该分类的歌曲
- 显示歌曲数量和空状态提示

### 分类标签
- 每首歌的卡片上会显示其所属分类
- 标签样式：紫色背景 + 小圆角

### 特殊分类

**最近播放**
- 自动记录播放过的歌曲
- 按播放时间倒序排列
- 最多保存50首

**我的收藏**
- 用户手动标记的收藏歌曲
- 点击歌曲可添加/取消收藏

## 💡 使用建议

### 分类命名规范

**按风格分类**：
- 流行歌曲、摇滚、电子、古典、爵士等

**按语言分类**：
- 华语歌曲、粤语歌曲、英文歌曲、日语歌曲等

**按情绪分类**：
- 治愈歌曲、励志歌曲、悲伤歌曲、欢快歌曲等

**按场景分类**：
- 运动音乐、睡前音乐、学习音乐、开车音乐等

### 组织建议

1. **不要创建太多分类**（建议5-10个）
2. **分类名称简洁明了**
3. **每首歌只属于一个主分类**
4. **使用有意义的emoji图标**

## 📂 示例配置

### 按风格分类

```javascript
export const categories = [
    { id: 'all', name: '全部', icon: '🎵' },
    { id: 'pop', name: '流行', icon: '🎤' },
    { id: 'rock', name: '摇滚', icon: '🎸' },
    { id: 'electronic', name: '电子', icon: '🎹' },
    { id: 'classical', name: '古典', icon: '🎻' },
    { id: 'recent', name: '最近播放', icon: '🕐' },
    { id: 'favorite', name: '我的收藏', icon: '❤️' }
];
```

### 按情绪分类

```javascript
export const categories = [
    { id: 'all', name: '全部', icon: '🎵' },
    { id: 'happy', name: '欢快', icon: '😊' },
    { id: 'sad', name: '伤感', icon: '😢' },
    { id: 'relax', name: '放松', icon: '😌' },
    { id: 'energetic', name: '活力', icon: '⚡' },
    { id: 'recent', name: '最近播放', icon: '🕐' },
    { id: 'favorite', name: '我的收藏', icon: '❤️' }
];
```

## 🔍 搜索与分类

搜索功能会搜索所有分类的歌曲，不受当前分类筛选影响。

## 📱 移动端优化

- 分类标签支持横向滚动
- 标签数量多时可以左右滑动查看

## ⚙️ 技术细节

### 分类数据流

```
tracks.js (配置)
    ↓
Library模块 (加载)
    ↓
StateManager (状态)
    ↓
UI渲染 (显示)
```

### 筛选逻辑

```javascript
if (category === 'all') {
    // 显示所有歌曲
} else if (category === 'recent') {
    // 显示最近播放
} else if (category === 'favorite') {
    // 显示收藏歌曲
} else {
    // 按category字段筛选
    filteredTracks = tracks.filter(t => t.category === category);
}
```

## 🎯 快速测试

1. 打开浏览器：`http://localhost:5000`
2. 点击"音乐库"
3. 查看顶部分类标签
4. 点击不同分类查看筛选效果
5. 观察歌曲卡片上的分类标签

## 📞 常见问题

**Q: 如何修改分类图标？**  
A: 在 `categories` 数组中修改 `icon` 字段，使用任何emoji。

**Q: 歌曲可以属于多个分类吗？**  
A: 当前设计每首歌只能属于一个主分类。如需多分类，可以使用标签系统（需要额外开发）。

**Q: 如何隐藏某个分类？**  
A: 从 `categories` 数组中删除对应项即可。

**Q: 分类顺序可以调整吗？**  
A: 可以，调整 `categories` 数组的顺序即可改变标签显示顺序。

## 🔄 更新记录

- **v2.1** - 添加分类系统
- 支持自定义分类
- 分类图标显示
- 分类标签UI
- 自动筛选功能