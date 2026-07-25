# 更新日志

## v2.1 - 歌曲分类系统 (2026-07-25)

### ✨ 新增功能

**分类系统**
- ✅ 支持自定义歌曲分类
- ✅ 动态生成分类标签
- ✅ 分类图标支持（使用emoji）
- ✅ 分类自动筛选功能
- ✅ 歌曲卡片显示分类标签

**当前分类**
- 🎵 全部
- 🎤 粤语歌曲（2首）
- 💝 治愈歌曲（2首）
- 🕐 最近播放
- ❤️ 我的收藏

### 🔧 修改的文件

1. **web/scripts/data/tracks.js**
   - 添加 `categories` 导出
   - 每首歌添加 `category` 字段
   - 定义分类配置数组

2. **web/scripts/modules/library.js**
   - 导入 `categories` 配置
   - 添加 `renderTabs()` 函数动态生成标签
   - 更新 `render()` 函数支持分类筛选
   - 更新 `createLibraryCard()` 显示分类标签

3. **web/scripts/app.js**
   - 导入 `categories`
   - 更新日志输出

4. **web/styles/components.css**
   - 添加 `.category-badge` 样式
   - 优化 `.library-tabs` 支持横向滚动
   - 调整 `.tab-btn` 样式

5. **web/index.html**
   - 清空硬编码的分类按钮（改为动态生成）

### 📝 新增文档

- **CATEGORY_GUIDE.md** - 分类系统完整使用指南

### 🎵 歌曲配置更新

所有4首歌曲已添加分类信息：
- 今天为你点亮 → 粤语歌曲
- 魅力隆回 → 粤语歌曲
- 宝贝你慢慢长大 → 治愈歌曲
- 不是终点 → 治愈歌曲

### 🎨 UI改进

**分类标签样式**
```css
.category-badge {
    背景: 半透明紫色
    文字: 主题紫色
    圆角: 小圆角
    大小: 0.75rem
}
```

**标签栏优化**
- 支持横向滚动（多分类时）
- 隐藏滚动条（移动端友好）
- 标签不换行

### 📊 使用方式

**添加新分类**
```javascript
// 在 tracks.js 中
export const categories = [
    { id: 'new-category', name: '新分类', icon: '🎼' }
];
```

**为歌曲指定分类**
```javascript
{
    id: 'track-x',
    title: '歌曲名',
    category: 'new-category',  // 关键字段
    ...
}
```

### 🔍 技术实现

**分类筛选逻辑**
```javascript
// 全部：显示所有
// 最近播放：从recentTracks获取
// 我的收藏：从favoriteTracks获取  
// 其他：按track.category === categoryId筛选
```

**动态标签生成**
- Library模块初始化时调用 `renderTabs()`
- 从 `tracks.js` 导入分类配置
- 自动生成标签按钮并绑定事件

### ✅ 测试清单

- [x] 分类标签正确显示
- [x] 点击分类筛选功能正常
- [x] 歌曲卡片显示分类标签
- [x] 空状态提示正确
- [x] 移动端横向滚动
- [x] 样式适配

### 📱 响应式

- 移动端：标签横向滚动
- 桌面端：标签自动排列
- 标签文字不换行

### 🎯 后续优化建议

1. **多分类支持** - 允许一首歌属于多个分类（使用标签数组）
2. **分类管理界面** - 可视化添加/编辑/删除分类
3. **分类统计** - 显示每个分类的歌曲数量
4. **分类颜色** - 每个分类可以有不同的主题色
5. **分类排序** - 支持拖拽调整分类顺序

---

## v2.0 - 内置歌曲模式 (2026-07-25)

详见 [CHANGELOG_v2.0.md](CHANGELOG_v2.0.md)