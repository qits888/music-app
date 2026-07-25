// 辅助函数：从纯文本歌词生成简单的LRC格式
// 注意：这只是简单的按行分配时间，实际应该手动调整时间戳
export function convertTextToLRC(text, intervalSeconds = 3) {
    const lines = text.split('\n').filter(line => line.trim());
    let lrc = '';
    let currentTime = 0;
    
    lines.forEach((line, index) => {
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        const ms = Math.floor((currentTime % 1) * 100);
        
        const timestamp = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}]`;
        lrc += `${timestamp}${line}\n`;
        
        // 空行间隔更长
        if (line.trim() === '') {
            currentTime += intervalSeconds * 0.5;
        } else {
            currentTime += intervalSeconds;
        }
    });
    
    return lrc;
}