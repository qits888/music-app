/**
 * 增强版歌词自动对齐工具
 * 
 * 核心功能：
 * 1. 句长感知：根据字数动态分配时长
 * 2. 结构识别：自动检测前奏/间奏/尾奏
 * 3. 智能分段：识别副歌/主歌等重复结构
 * 4. 渐进式调优：支持部分手动标注后自动插值
 */

// ==================== 工具函数 ====================

/**
 * 计算文本复杂度（用于时长权重）
 * @param {string} text - 歌词文本
 * @returns {number} 复杂度分数
 */
function calculateComplexity(text) {
    const cleaned = text.trim();
    const charCount = cleaned.length;
    const wordCount = cleaned.split(/\s+/).length;
    
    // 标点符号增加复杂度（表示停顿）
    const punctuationBonus = (cleaned.match(/[，。！？、,\.!?]/g) || []).length * 0.5;
    
    // 英文单词比中文字需要更多时间
    const englishBonus = (cleaned.match(/[a-zA-Z]+/g) || []).reduce((sum, word) => sum + word.length * 0.3, 0);
    
    return charCount + punctuationBonus + englishBonus;
}

/**
 * 识别重复段落（副歌等）
 * @param {Array<string>} lines - 所有歌词行
 * @returns {Array<{start, end, similarity}>} 重复段落信息
 */
function detectRepeatedSections(lines) {
    const sections = [];
    const minSectionLength = 4; // 最少4行才算段落
    
    for (let i = 0; i < lines.length - minSectionLength; i++) {
        for (let len = minSectionLength; len <= 8 && i + len <= lines.length; len++) {
            const section = lines.slice(i, i + len).join('\n');
            
            // 查找后续相同或相似的段落
            for (let j = i + len; j < lines.length - len; j++) {
                const candidate = lines.slice(j, j + len).join('\n');
                const similarity = calculateSimilarity(section, candidate);
                
                if (similarity > 0.8) {
                    sections.push({ 
                        original: { start: i, end: i + len },
                        repeat: { start: j, end: j + len },
                        similarity 
                    });
                }
            }
        }
    }
    
    return sections;
}

/**
 * 计算两段文本的相似度
 */
function calculateSimilarity(text1, text2) {
    if (text1 === text2) return 1.0;
    
    const len1 = text1.length;
    const len2 = text2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 1.0;
    
    // 简单的编辑距离相似度
    let matches = 0;
    const minLen = Math.min(len1, len2);
    for (let i = 0; i < minLen; i++) {
        if (text1[i] === text2[i]) matches++;
    }
    
    return matches / maxLen;
}

/**
 * 检测音乐结构（前奏/间奏/尾奏）
 * @param {Array<string>} lines - 歌词行
 * @param {number} totalDuration - 总时长（秒）
 * @returns {Object} 结构信息
 */
function detectMusicStructure(lines, totalDuration) {
    const avgLineComplexity = lines.reduce((sum, line) => sum + calculateComplexity(line), 0) / lines.length;
    const totalComplexity = lines.reduce((sum, line) => sum + calculateComplexity(line), 0);
    
    // 估算实际演唱时长（假设平均每字0.3-0.5秒）
    const estimatedSingingDuration = totalComplexity * 0.4;
    const instrumentalTime = Math.max(0, totalDuration - estimatedSingingDuration);
    
    // 前奏通常占总时长的 5-15%
    const introRatio = Math.min(0.15, instrumentalTime / totalDuration * 0.4);
    const introDuration = totalDuration * introRatio;
    
    // 尾奏通常占 3-10%
    const outroRatio = Math.min(0.10, instrumentalTime / totalDuration * 0.3);
    const outroDuration = totalDuration * outroRatio;
    
    // 间奏检测：如果有明显的空行或重复段落间隙
    const interludeGaps = detectInterludeGaps(lines);
    
    return {
        intro: { duration: introDuration },
        outro: { duration: outroDuration },
        interludes: interludeGaps.map(gap => ({
            afterLine: gap.lineIndex,
            duration: gap.estimatedDuration
        }))
    };
}

/**
 * 检测间奏位置（基于歌词密度变化）
 */
function detectInterludeGaps(lines) {
    const gaps = [];
    
    for (let i = 0; i < lines.length - 1; i++) {
        const currentComplexity = calculateComplexity(lines[i]);
        const nextComplexity = calculateComplexity(lines[i + 1]);
        
        // 如果连续多行很短或为空，可能是间奏
        if (currentComplexity < 5 && nextComplexity < 5) {
            // 检查是否是段落间的自然停顿
            const contextComplexity = (
                calculateComplexity(lines[Math.max(0, i - 1)]) +
                calculateComplexity(lines[Math.min(lines.length - 1, i + 2)])
            ) / 2;
            
            if (contextComplexity > 10) {
                gaps.push({
                    lineIndex: i,
                    estimatedDuration: 3.0 // 默认3秒间奏
                });
            }
        }
    }
    
    return gaps;
}

// ==================== 核心对齐算法 ====================

/**
 * 增强版歌词对齐
 * @param {string} lyricsText - 原始歌词文本（纯文本或LRC格式）
 * @param {number} totalDuration - 音频总时长（秒）
 * @param {Object} options - 配置选项
 * @returns {string} LRC格式歌词
 */
export function enhancedAlign(lyricsText, totalDuration, options = {}) {
    const {
        minLineGap = 0.5,        // 最小行间隔（秒）
        maxLineGap = 5.0,        // 最大行间隔（秒）
        introRatio = 0.08,       // 前奏比例（可手动覆盖）
        outroRatio = 0.05,       // 尾奏比例
        enableStructureDetection = true,  // 是否启用结构检测
        manualTimestamps = []    // 手动标注的时间点 [{lineIndex, timestamp}]
    } = options;
    
    // 解析输入
    const parsed = parseLyrics(lyricsText);
    const lines = parsed.lines;
    
    if (lines.length === 0) {
        return lyricsText;
    }
    
    // 如果已经有部分手动时间戳，使用渐进式对齐
    if (manualTimestamps.length > 0) {
        return progressiveAlign(lines, totalDuration, manualTimestamps, options);
    }
    
    // 计算每行的复杂度权重
    const complexities = lines.map(line => calculateComplexity(line.text));
    const totalComplexity = complexities.reduce((sum, c) => sum + c, 0);
    
    // 检测音乐结构
    const structure = enableStructureDetection 
        ? detectMusicStructure(lines.map(l => l.text), totalDuration)
        : { intro: { duration: totalDuration * introRatio }, outro: { duration: totalDuration * outroRatio }, interludes: [] };
    
    // 可用于歌词的时间
    const availableDuration = totalDuration - structure.intro.duration - structure.outro.duration 
        - structure.interludes.reduce((sum, inter) => sum + inter.duration, 0);
    
    // 分配时间戳
    const timestamps = [];
    let currentTime = structure.intro.duration;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 检查是否在间奏后
        const interludeAfterPrev = structure.interludes.find(inter => inter.afterLine === i - 1);
        if (interludeAfterPrev) {
            currentTime += interludeAfterPrev.duration;
        }
        
        timestamps.push(currentTime);
        
        // 根据复杂度分配下一行的间隔
        if (i < lines.length - 1) {
            const weight = complexities[i] / totalComplexity;
            const allocatedTime = availableDuration * weight;
            const lineGap = Math.max(minLineGap, Math.min(maxLineGap, allocatedTime));
            
            currentTime += lineGap;
        }
    }
    
    // 归一化时间戳，确保最后一行不超过总时长 - 尾奏时长
    const maxTimestamp = totalDuration - structure.outro.duration;
    const actualMaxTimestamp = timestamps[timestamps.length - 1];
    
    if (actualMaxTimestamp > maxTimestamp) {
        const scaleFactor = maxTimestamp / actualMaxTimestamp;
        for (let i = 0; i < timestamps.length; i++) {
            timestamps[i] = structure.intro.duration + (timestamps[i] - structure.intro.duration) * scaleFactor;
        }
    }
    
    // 生成LRC格式
    return generateLRC(lines, timestamps, parsed.metadata);
}

/**
 * 渐进式对齐（基于部分手动时间戳）
 */
function progressiveAlign(lines, totalDuration, manualTimestamps, options) {
    // 按行索引排序
    const sortedManual = [...manualTimestamps].sort((a, b) => a.lineIndex - b.lineIndex);
    
    const timestamps = new Array(lines.length);
    
    // 填充手动时间戳
    for (const manual of sortedManual) {
        timestamps[manual.lineIndex] = manual.timestamp;
    }
    
    // 在手动时间戳之间插值
    let lastKnownIndex = -1;
    let lastKnownTime = options.introRatio ? totalDuration * options.introRatio : 0;
    
    for (let i = 0; i < lines.length; i++) {
        if (timestamps[i] !== undefined) {
            // 这是一个已知时间戳
            if (lastKnownIndex >= 0) {
                // 在上一个已知点和当前点之间插值
                interpolateSegment(lines, timestamps, lastKnownIndex, i, lastKnownTime, timestamps[i]);
            } else {
                // 从开始到第一个已知点
                interpolateSegment(lines, timestamps, 0, i, lastKnownTime, timestamps[i]);
            }
            
            lastKnownIndex = i;
            lastKnownTime = timestamps[i];
        }
    }
    
    // 处理最后一段（最后一个已知点到结尾）
    if (lastKnownIndex < lines.length - 1) {
        const endTime = totalDuration * (1 - (options.outroRatio || 0.05));
        interpolateSegment(lines, timestamps, lastKnownIndex, lines.length - 1, lastKnownTime, endTime);
    }
    
    return generateLRC(lines.map(l => ({ text: l.text || l })), timestamps);
}

/**
 * 在两个已知时间戳之间插值
 */
function interpolateSegment(lines, timestamps, startIdx, endIdx, startTime, endTime) {
    if (startIdx === endIdx) {
        timestamps[startIdx] = startTime;
        return;
    }
    
    // 计算这段的复杂度分布
    const segmentLines = lines.slice(startIdx, endIdx + 1);
    const complexities = segmentLines.map(line => 
        calculateComplexity(typeof line === 'string' ? line : line.text)
    );
    const totalComplexity = complexities.reduce((sum, c) => sum + c, 0);
    
    const availableTime = endTime - startTime;
    let currentTime = startTime;
    
    for (let i = startIdx; i <= endIdx; i++) {
        if (timestamps[i] === undefined) {
            timestamps[i] = currentTime;
        }
        
        if (i < endIdx) {
            const weight = complexities[i - startIdx] / totalComplexity;
            const allocatedTime = availableTime * weight;
            currentTime += allocatedTime;
        }
    }
}

/**
 * 解析歌词（支持纯文本和LRC格式）
 */
function parseLyrics(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const metadata = {};
    const lyricsLines = [];
    
    for (const line of lines) {
        // LRC元数据标签
        if (line.match(/^\[(ti|ar|al|by):/)) {
            const match = line.match(/^\[(\w+):(.+)\]$/);
            if (match) {
                metadata[match[1]] = match[2].trim();
            }
            continue;
        }
        
        // LRC时间戳行
        const timestampMatch = line.match(/^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\](.*)$/);
        if (timestampMatch) {
            const minutes = parseInt(timestampMatch[1]);
            const seconds = parseInt(timestampMatch[2]);
            const ms = timestampMatch[3] ? parseInt(timestampMatch[3].padEnd(3, '0')) : 0;
            const text = timestampMatch[4].trim();
            
            lyricsLines.push({
                timestamp: minutes * 60 + seconds + ms / 1000,
                text
            });
            continue;
        }
        
        // 纯文本行
        lyricsLines.push({ text: line });
    }
    
    return { metadata, lines: lyricsLines };
}

/**
 * 生成LRC格式
 */
function generateLRC(lines, timestamps, metadata = {}) {
    let lrc = '';
    
    // 添加元数据
    if (metadata.ti) lrc += `[ti:${metadata.ti}]\n`;
    if (metadata.ar) lrc += `[ar:${metadata.ar}]\n`;
    if (metadata.al) lrc += `[al:${metadata.al}]\n`;
    if (metadata.by) lrc += `[by:${metadata.by}]\n`;
    
    if (Object.keys(metadata).length > 0) {
        lrc += '\n';
    }
    
    // 添加歌词行
    for (let i = 0; i < lines.length; i++) {
        const timestamp = timestamps[i];
        const minutes = Math.floor(timestamp / 60);
        const seconds = Math.floor(timestamp % 60);
        const ms = Math.floor((timestamp % 1) * 100);
        
        const timeTag = `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}]`;
        const text = typeof lines[i] === 'string' ? lines[i] : lines[i].text;
        
        lrc += `${timeTag}${text}\n`;
    }
    
    return lrc;
}

// ==================== 导出工具函数 ====================

/**
 * 批量处理多首歌曲
 */
export function batchAlign(tracks) {
    return tracks.map(track => ({
        ...track,
        alignedLyrics: enhancedAlign(track.lyrics, track.duration, {
            enableStructureDetection: true
        })
    }));
}

/**
 * 生成手动调优界面所需的数据
 */
export function prepareForManualTuning(lyricsText, totalDuration) {
    const parsed = parseLyrics(lyricsText);
    const lines = parsed.lines.map(l => l.text);
    const complexities = lines.map(calculateComplexity);
    
    return {
        lines,
        complexities,
        structure: detectMusicStructure(lines, totalDuration),
        repeatedSections: detectRepeatedSections(lines),
        suggestedTimestamps: enhancedAlign(lyricsText, totalDuration).split('\n')
            .filter(line => line.match(/^\[\d{2}:\d{2}/))
            .map(line => {
                const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2})\]/);
                if (match) {
                    return parseInt(match[1]) * 60 + parseInt(match[2]) + parseInt(match[3]) / 100;
                }
                return 0;
            })
    };
}

/**
 * 从音频文件自动分析节奏（需要Web Audio API支持）
 */
export async function analyzeAudioRhythm(audioUrl) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // 分析能量包络
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const windowSize = sampleRate * 0.1; // 100ms窗口
        
        const energyProfile = [];
        for (let i = 0; i < channelData.length; i += windowSize) {
            let energy = 0;
            const end = Math.min(i + windowSize, channelData.length);
            for (let j = i; j < end; j++) {
                energy += channelData[j] * channelData[j];
            }
            energyProfile.push({
                time: i / sampleRate,
                energy: energy / (end - i)
            });
        }
        
        // 检测能量突变点（可能是段落开始）
        const changes = [];
        for (let i = 1; i < energyProfile.length; i++) {
            const energyChange = Math.abs(energyProfile[i].energy - energyProfile[i - 1].energy);
            if (energyChange > 0.01) {
                changes.push({
                    time: energyProfile[i].time,
                    magnitude: energyChange
                });
            }
        }
        
        audioContext.close();
        
        return {
            duration: audioBuffer.duration,
            energyProfile,
            structureChanges: changes.sort((a, b) => b.magnitude - a.magnitude).slice(0, 10)
        };
    } catch (error) {
        console.error('音频分析失败:', error);
        return null;
    }
}