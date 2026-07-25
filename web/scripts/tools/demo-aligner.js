/**
 * 快速演示脚本 - 在浏览器控制台运行
 * 演示增强版歌词对齐算法的效果
 */

// ==================== 演示1: 基础对齐 ====================

console.log('=== 演示1: 基础句长感知对齐 ===\n');

const demoLyrics1 = `今晚的灯光慢慢亮
笑声落在你身旁
蛋糕香甜，蜡烛微光
我们把祝福轻轻唱
窗外的星星排成一行
像是偷偷赶来为你鼓掌`;

const duration1 = 30.0;

import { enhancedAlign } from './scripts/tools/enhanced-lyrics-aligner.js';

const result1 = enhancedAlign(demoLyrics1, duration1, {
    introRatio: 0.10,
    outroRatio: 0.05
});

console.log('输入歌词（6行）：\n' + demoLyrics1);
console.log('\n总时长：30秒');
console.log('\n对齐结果：\n' + result1);
console.log('\n注意观察：');
console.log('- 较短的句子（如"笑声落在你身旁"）间隔较小');
console.log('- 较长的句子（如"窗外的星星排成一行"）间隔较大');
console.log('- 有3秒前奏（10%），1.5秒尾奏（5%）\n');


// ==================== 演示2: 对比固定间隔 ====================

console.log('=== 演示2: 对比固定间隔 vs 句长感知 ===\n');

function fixedIntervalAlign(lyrics, duration) {
    const lines = lyrics.split('\n').filter(l => l.trim());
    const gap = duration / (lines.length + 1);
    let result = '';
    
    lines.forEach((line, i) => {
        const time = (i + 1) * gap;
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        const ms = Math.floor((time % 1) * 100);
        result += `[${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(2, '0')}]${line}\n`;
    });
    
    return result;
}

const demoLyrics2 = `短
这句稍微长一点
这是一句非常非常非常长的歌词，包含很多字
短`;

console.log('输入歌词（4行，长度差异大）：');
console.log(demoLyrics2);
console.log('\n总时长：20秒\n');

console.log('【旧算法】固定间隔（每行4秒）：');
console.log(fixedIntervalAlign(demoLyrics2, 20));

console.log('【新算法】句长感知：');
const result2 = enhancedAlign(demoLyrics2, 20, { 
    introRatio: 0, 
    outroRatio: 0,
    enableStructureDetection: false 
});
console.log(result2);

console.log('结果分析：');
console.log('- 旧算法：所有行间隔相同（4秒），不合理');
console.log('- 新算法：短句间隔小，长句间隔大，更符合实际演唱\n');


// ==================== 演示3: 手动标注 + 自动插值 ====================

console.log('=== 演示3: 渐进式对齐（手动标注 + 自动插值）===\n');

const demoLyrics3 = `第1行
第2行
第3行
第4行
第5行
第6行
第7行
第8行
第9行
第10行`;

console.log('场景：10行歌词，只手动标注3个时间点\n');

const manualPoints = [
    { lineIndex: 0, timestamp: 5.0 },   // 第1行在5秒
    { lineIndex: 4, timestamp: 25.0 },  // 第5行在25秒
    { lineIndex: 9, timestamp: 55.0 }   // 第10行在55秒
];

console.log('手动标注：');
console.log('- 第1行 = 5.0秒');
console.log('- 第5行 = 25.0秒');
console.log('- 第10行 = 55.0秒\n');

const result3 = enhancedAlign(demoLyrics3, 60, {
    manualTimestamps: manualPoints,
    introRatio: 0,
    outroRatio: 0
});

console.log('对齐结果（自动插值其余7行）：\n' + result3);
console.log('优势：只需标注几个关键点，其余自动按复杂度分配\n');


// ==================== 演示4: 结构识别 ====================

console.log('=== 演示4: 音乐结构识别 ===\n');

const demoLyrics4 = `第一段歌词
继续唱
还在唱
第一段结束


第二段开始了
又是新内容
第二段结束`;

console.log('输入歌词（有空行，代表间奏）：');
console.log(demoLyrics4.split('\n').map((l, i) => `${i+1}. ${l || '(空行)'}`).join('\n'));
console.log('\n总时长：60秒\n');

const result4 = enhancedAlign(demoLyrics4, 60, {
    enableStructureDetection: true,
    introRatio: 0.10,
    outroRatio: 0.08
});

console.log('对齐结果：\n' + result4);

console.log('结构分析：');
console.log('- 检测到6秒前奏（10%）');
console.log('- 检测到空行附近可能有间奏');
console.log('- 预留4.8秒尾奏（8%）\n');


// ==================== 演示5: 实际歌曲片段 ====================

console.log('=== 演示5: 实际歌曲片段对齐 ===\n');

const realLyrics = `愿你今天快乐，往后也闪闪发光
每一个明天，都有新的太阳
愿你心里的梦，慢慢开成花香
一路有人陪你，一路有爱在身旁`;

console.log('歌词（副歌部分）：\n' + realLyrics);
console.log('\n假设这段副歌时长：15秒\n');

const result5 = enhancedAlign(realLyrics, 15, {
    introRatio: 0,
    outroRatio: 0,
    minLineGap: 0.5,
    maxLineGap: 5.0
});

console.log('对齐结果：\n' + result5);

// 分析间隔
const timestamps = result5.split('\n')
    .filter(l => l.match(/^\[\d{2}:/))
    .map(l => {
        const match = l.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/);
        return parseInt(match[1]) * 60 + parseInt(match[2]) + parseInt(match[3]) / 100;
    });

console.log('行间隔分析：');
for (let i = 1; i < timestamps.length; i++) {
    const gap = (timestamps[i] - timestamps[i-1]).toFixed(2);
    console.log(`第${i}行到第${i+1}行：${gap}秒`);
}

console.log('\n观察：间隔根据句子长度动态调整\n');


// ==================== 总结 ====================

console.log('='.repeat(60));
console.log('增强版歌词对齐算法 - 核心特性总结');
console.log('='.repeat(60));
console.log('');
console.log('✅ 句长感知：长句多分配时间，短句少分配');
console.log('✅ 结构识别：自动检测前奏、间奏、尾奏');
console.log('✅ 渐进式调优：支持手动标注 + 自动插值');
console.log('✅ 时间戳归一化：确保不超出总时长');
console.log('');
console.log('📖 详细文档：ENHANCED_ALIGNER_GUIDE.md');
console.log('🧪 可视化测试：http://localhost:5000/test-aligner.html');
console.log('');
console.log('🚀 下一步：');
console.log('   1. 访问 test-aligner.html 进行可视化测试');
console.log('   2. 使用真实歌曲测试对齐效果');
console.log('   3. 根据播放效果调整参数');
console.log('');
console.log('='.repeat(60));