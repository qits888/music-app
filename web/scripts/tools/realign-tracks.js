/**
 * 批量重新对齐现有歌曲的歌词
 * 使用增强版算法生成更精确的时间戳
 */

import { enhancedAlign } from './enhanced-lyrics-aligner.js';
import { builtInTracks } from '../data/tracks.js';

/**
 * 重新对齐所有歌曲
 */
export function realignAllTracks() {
    console.log('开始重新对齐所有歌曲...\n');
    
    const realignedTracks = builtInTracks.map(track => {
        console.log(`处理: ${track.title}`);
        console.log(`  原始时长: ${track.duration}秒`);
        
        // 使用增强版算法重新对齐
        const alignedLyrics = enhancedAlign(track.lyrics, track.duration, {
            minLineGap: 0.8,           // 最小0.8秒间隔，避免过快
            maxLineGap: 6.0,           // 最大6秒，适应长间奏
            introRatio: 0.08,          // 8%前奏
            outroRatio: 0.06,          // 6%尾奏
            enableStructureDetection: true
        });
        
        const linesCount = alignedLyrics.split('\n').filter(l => l.match(/^\[\d{2}:/)).length;
        console.log(`  歌词行数: ${linesCount}`);
        console.log(`  ✓ 完成\n`);
        
        return {
            ...track,
            lyrics: alignedLyrics
        };
    });
    
    console.log('所有歌曲对齐完成！');
    return realignedTracks;
}

/**
 * 生成新的 tracks.js 文件内容
 */
export function generateTracksFile(realignedTracks) {
    let content = `// 内置歌曲（使用增强版自动对齐算法生成）\n`;
    content += `export const builtInTracks = [\n`;
    
    realignedTracks.forEach((track, index) => {
        content += `    {\n`;
        content += `        id: "${track.id}",\n`;
        content += `        title: "${track.title}",\n`;
        content += `        artist: "${track.artist}",\n`;
        content += `        album: "${track.album}",\n`;
        content += `        category: "${track.category}",\n`;
        content += `        src: "${track.src}",\n`;
        content += `        cover: "${track.cover}",\n`;
        content += `        duration: ${track.duration.toFixed(2)},\n`;
        content += `        lyrics: ${JSON.stringify(track.lyrics)}\n`;
        content += `    }${index < realignedTracks.length - 1 ? ',' : ''}\n`;
    });
    
    content += `];\n\n`;
    content += `export const categories = [\n`;
    content += `    { id: 'all', name: '全部', icon: '🎵' },\n`;
    content += `    { id: '粤语歌曲', name: '粤语歌曲', icon: '🎤' },\n`;
    content += `    { id: '治愈歌曲', name: '治愈歌曲', icon: '💝' },\n`;
    content += `    { id: 'recent', name: '最近播放', icon: '🕐' },\n`;
    content += `    { id: 'favorite', name: '我的收藏', icon: '❤️' }\n`;
    content += `];\n`;
    
    return content;
}

/**
 * 命令行入口（在浏览器控制台使用）
 */
if (typeof window !== 'undefined') {
    window.realignTracks = async function() {
        const realigned = realignAllTracks();
        const newContent = generateTracksFile(realigned);
        
        console.log('\n=== 生成的新 tracks.js 内容 ===\n');
        console.log('请复制以下内容替换 web/scripts/data/tracks.js：\n');
        console.log(newContent);
        
        // 也可以直接下载
        const blob = new Blob([newContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tracks-realigned.js';
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('\n✓ 文件已自动下载为 tracks-realigned.js');
        return realigned;
    };
}