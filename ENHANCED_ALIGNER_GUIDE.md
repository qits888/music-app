# 增强版歌词自动对齐工具使用指南

## 📖 概述

增强版歌词自动对齐工具是一个基于**句长感知 + 音乐结构识别**的智能LRC时间戳生成系统，相比传统固定间隔算法，能显著提升歌词同步精度。

## ✨ 核心特性

### 1. 句长感知分配
- 根据每句歌词的**字数、标点、英文单词**计算复杂度
- 按复杂度比例动态分配时长，长句获得更多时间
- 避免固定间隔导致的前紧后松问题

### 2. 音乐结构识别
- **自动检测前奏**：根据总时长和歌词密度估算前奏时长
- **自动检测尾奏**：为歌曲结尾预留渐弱时间
- **间奏识别**：基于歌词密度变化检测段落间的间奏

### 3. 渐进式对齐
- 支持**部分手动标注**时间点
- 在已知时间点之间智能插值
- 适合"先粗后精"的调优流程

### 4. 时间戳归一化
- 自动调整确保最后一行不超出总时长
- 支持最小/最大行间隔限制
- 防止时间戳溢出或过于密集

## 🚀 快速开始

### 方法一：使用可视化测试页面（推荐）

1. 启动本地服务器：
```bash
cd "E:\项目\Music app\web"
python -m http.server 5000
```

2. 浏览器访问：`http://localhost:5000/test-aligner.html`

3. 填写表单：
   - 歌曲名称、歌手（可选，用于生成元数据）
   - **音频时长**（秒，必填）
   - **歌词文本**（纯文本或LRC格式）
   - 调整参数（可选）

4. 点击"开始对齐"，查看结果并下载LRC文件

### 方法二：在代码中直接调用

```javascript
import { enhancedAlign } from './scripts/tools/enhanced-lyrics-aligner.js';

const lyricsText = `今晚的灯光慢慢亮
笑声落在你身旁
蛋糕香甜，蜡烛微光
我们把祝福轻轻唱`;

const totalDuration = 237.80; // 秒

const lrcResult = enhancedAlign(lyricsText, totalDuration, {
    minLineGap: 0.8,        // 最小行间隔
    maxLineGap: 6.0,        // 最大行间隔
    introRatio: 0.08,       // 前奏比例（8%）
    outroRatio: 0.06,       // 尾奏比例（6%）
    enableStructureDetection: true  // 启用结构检测
});

console.log(lrcResult);
```

### 方法三：批量处理现有歌曲

```javascript
import { realignAllTracks } from './scripts/tools/realign-tracks.js';

// 在浏览器控制台运行
realignTracks();

// 会自动下载新的 tracks.js 文件
```

## ⚙️ 参数说明

### 基础参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `lyricsText` | string | 必填 | 歌词文本（纯文本或LRC格式） |
| `totalDuration` | number | 必填 | 音频总时长（秒） |

### 选项参数 (options)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `minLineGap` | number | 0.5 | 最小行间隔（秒），防止歌词过于密集 |
| `maxLineGap` | number | 5.0 | 最大行间隔（秒），防止长时间空白 |
| `introRatio` | number | 0.08 | 前奏占总时长比例（0-0.3） |
| `outroRatio` | number | 0.05 | 尾奏占总时长比例（0-0.2） |
| `enableStructureDetection` | boolean | true | 是否启用自动结构检测 |
| `manualTimestamps` | array | [] | 手动标注的时间点（见下文） |

### 手动标注格式

```javascript
const manualTimestamps = [
    { lineIndex: 0, timestamp: 10.5 },   // 第1行在10.5秒
    { lineIndex: 10, timestamp: 60.0 },  // 第11行在60秒
    { lineIndex: 20, timestamp: 120.0 }  // 第21行在120秒
];

const result = enhancedAlign(lyrics, duration, { manualTimestamps });
// 其他未标注的行会自动插值
```

## 📊 算法原理

### 复杂度计算公式

```javascript
复杂度 = 字符数 + 标点符号数 × 0.5 + 英文字母数 × 0.3
```

- **字符数**：中文字、数字等基础权重
- **标点符号**：代表停顿，增加0.5权重
- **英文单词**：发音较长，每字母增加0.3权重

### 时间分配流程

```
1. 解析歌词 → 计算每行复杂度
2. 检测音乐结构 → 识别前奏/间奏/尾奏
3. 计算可用时长 = 总时长 - 前奏 - 尾奏 - 所有间奏
4. 按复杂度比例分配时间戳
5. 归一化调整 → 确保不超出总时长
```

### 结构检测逻辑

**前奏检测**：
```
估算演唱时长 = 总字数 × 0.4秒/字
剩余时间 = 总时长 - 估算演唱时长
前奏时长 = min(总时长 × 15%, 剩余时间 × 40%)
```

**间奏检测**：
- 连续多行字数 < 5 且前后有复杂度 > 10 的行
- 默认间奏时长 = 3秒

**尾奏检测**：
```
尾奏时长 = min(总时长 × 10%, 剩余时间 × 30%)
```

## 🎯 使用建议

### 1. 参数调优指南

**快节奏歌曲**（流行、说唱）：
```javascript
{
    minLineGap: 0.5,
    maxLineGap: 4.0,
    introRatio: 0.05,
    outroRatio: 0.03
}
```

**慢节奏歌曲**（民谣、抒情）：
```javascript
{
    minLineGap: 1.0,
    maxLineGap: 8.0,
    introRatio: 0.10,
    outroRatio: 0.08
}
```

**有明显间奏**（摇滚、电音）：
```javascript
{
    enableStructureDetection: true,
    maxLineGap: 10.0  // 允许更长间隔
}
```

### 2. 提升精度的方法

#### 方法A：先自动后手动
1. 用增强版算法生成初始LRC
2. 在专业工具（如LrcMaker）中加载
3. 边听边微调个别时间点

#### 方法B：混合标注
1. 手动标注几个关键时间点（副歌开头、高潮部分）
2. 使用`manualTimestamps`参数
3. 算法自动插值其余部分

```javascript
// 示例：标注3个关键点，其余自动插值
const keyPoints = [
    { lineIndex: 0, timestamp: 12.5 },    // 第一句准确时间
    { lineIndex: 15, timestamp: 75.0 },   // 副歌开始
    { lineIndex: 40, timestamp: 180.0 }   // 最后一句
];

const result = enhancedAlign(lyrics, 220.0, { 
    manualTimestamps: keyPoints 
});
```

#### 方法C：音频分析增强（实验性）
```javascript
import { analyzeAudioRhythm } from './enhanced-lyrics-aligner.js';

// 分析音频能量变化
const audioInfo = await analyzeAudioRhythm('path/to/audio.mp3');

// 使用能量突变点优化前奏检测
const introTime = audioInfo.structureChanges[0].time;
```

### 3. 常见问题处理

**问题1：歌词前半段太快，后半段太慢**
- **原因**：音乐节奏变化，但算法假设均匀分布
- **解决**：使用手动标注，在节奏变化点标注2-3个时间戳

**问题2：间奏部分没有停顿**
- **原因**：间奏检测失败（歌词行没有明显密度变化）
- **解决**：手动在间奏前后标注时间点，或调大`maxLineGap`

**问题3：前奏/尾奏时长不准确**
- **原因**：自动估算偏差
- **解决**：手动设置`introRatio`和`outroRatio`参数

**问题4：某些长句播放太快**
- **原因**：复杂度计算未考虑特殊情况（如大段英文、连读）
- **解决**：在该句前后添加手动时间戳，或拆分成多行

## 📝 输出格式

生成的LRC文件格式：

```
[ti:歌曲名称]
[ar:歌手]
[by:MusicApp Enhanced Aligner]

[00:12.50]今晚的灯光慢慢亮
[00:15.30]笑声落在你身旁
[00:17.80]蛋糕香甜，蜡烛微光
...
```

时间戳格式：`[MM:SS.CC]` （分:秒.百分之一秒）

## 🔧 高级用法

### 1. 自定义复杂度计算

```javascript
// 修改 enhanced-lyrics-aligner.js 中的 calculateComplexity 函数
function calculateComplexity(text) {
    const cleaned = text.trim();
    
    // 自定义权重
    const chineseChars = (cleaned.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (cleaned.match(/[a-zA-Z]+/g) || []).length;
    const numbers = (cleaned.match(/\d+/g) || []).length;
    
    return chineseChars * 1.0 + 
           englishWords * 1.5 + 
           numbers * 0.8;
}
```

### 2. 批量处理多首歌曲

```javascript
import { batchAlign } from './enhanced-lyrics-aligner.js';

const tracks = [
    { lyrics: '...', duration: 200 },
    { lyrics: '...', duration: 180 },
    // ...
];

const results = batchAlign(tracks);
results.forEach((track, index) => {
    console.log(`歌曲${index + 1}处理完成`);
    // 保存或更新数据库
});
```

### 3. 与现有系统集成

```javascript
// 在 app.js 中集成
import { enhancedAlign } from './tools/enhanced-lyrics-aligner.js';

EventBus.on('track:add', async (track) => {
    if (track.lyrics && !track.lyrics.includes('[00:')) {
        // 如果是纯文本歌词，自动生成LRC
        const duration = await AudioEngine.getDuration(track.src);
        track.lyrics = enhancedAlign(track.lyrics, duration);
    }
});
```

## ⚠️ 注意事项

1. **精度限制**：自动对齐只能达到±1秒左右的精度，无法替代专业手动标注
2. **音频依赖**：需要准确的音频时长，建议从实际音频文件获取
3. **结构假设**：算法假设歌曲有标准结构（前奏-主体-尾奏），特殊编曲可能需要手动调整
4. **中文优化**：主要针对中文歌词优化，其他语言可能需要调整复杂度计算
5. **性能考虑**：音频分析（`analyzeAudioRhythm`）较耗时，大文件建议异步处理

## 📚 参考资料

- **LRC格式标准**：[LRC File Format](https://en.wikipedia.org/wiki/LRC_(file_format))
- **专业工具推荐**：
  - [LrcMaker](https://lrcmaker.com/) - 在线歌词编辑器
  - [Aegisub](http://www.aegisub.org/) - 专业字幕/歌词编辑
- **Web Audio API**：[MDN文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 🤝 反馈与改进

遇到问题或有改进建议？
- 检查`test-aligner.html`页面的控制台输出
- 调整参数后对比效果
- 记录特殊场景的参数配置供后续参考

---

**版本**：v2.0 Enhanced  
**更新日期**：2024  
**兼容性**：现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）