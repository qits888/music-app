// 音频可视化模块
import { AudioEngine } from '../core/audio-engine.js';
import { EventBus } from '../core/event-bus.js';
import { $ } from '../utils/dom.js';

export const Visualizer = (() => {
    let canvas = null;
    let ctx = null;
    let analyser = null;
    let dataArray = null;
    let bufferLength = 0;
    let animationId = null;
    let visualizerType = 'bars'; // bars, wave, circle

    const init = () => {
        canvas = $('#visualizer-canvas');
        if (!canvas) return;
        
        ctx = canvas.getContext('2d');
        resizeCanvas();
        
        window.addEventListener('resize', resizeCanvas);
        EventBus.on('audio:play', start);
        EventBus.on('audio:pause', stop);
        EventBus.on('audio:ended', stop);
    };

    const resizeCanvas = () => {
        if (!canvas) return;
        
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    };

    const start = () => {
        analyser = AudioEngine.getAnalyser();
        
        if (!analyser) {
            console.warn('分析器不可用');
            return;
        }
        
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        if (!animationId) {
            animate();
        }
    };

    const stop = () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        clear();
    };

    const animate = () => {
        animationId = requestAnimationFrame(animate);
        
        if (!analyser || !dataArray) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        switch (visualizerType) {
            case 'bars':
                drawBars();
                break;
            case 'wave':
                drawWave();
                break;
            case 'circle':
                drawCircle();
                break;
        }
    };

    const drawBars = () => {
        if (!ctx || !canvas) return;
        
        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;
        
        ctx.clearRect(0, 0, width, height);
        
        const barCount = 64;
        const barWidth = width / barCount;
        const step = Math.floor(bufferLength / barCount);
        
        for (let i = 0; i < barCount; i++) {
            const value = dataArray[i * step];
            const percent = value / 255;
            const barHeight = height * percent * 0.8;
            
            const hue = (i / barCount) * 60 + 220; // 蓝紫色范围
            ctx.fillStyle = `hsl(${hue}, 70%, ${50 + percent * 20}%)`;
            
            const x = i * barWidth;
            const y = height - barHeight;
            
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
    };

    const drawWave = () => {
        if (!ctx || !canvas) return;
        
        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;
        
        ctx.clearRect(0, 0, width, height);
        
        analyser.getByteTimeDomainData(dataArray);
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#6366f1';
        ctx.beginPath();
        
        const sliceWidth = width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    };

    const drawCircle = () => {
        if (!ctx || !canvas) return;
        
        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;
        
        ctx.clearRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.3;
        
        const barCount = 64;
        const step = Math.floor(bufferLength / barCount);
        
        for (let i = 0; i < barCount; i++) {
            const value = dataArray[i * step];
            const percent = value / 255;
            const barLength = radius * percent * 0.8;
            
            const angle = (i / barCount) * Math.PI * 2;
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barLength);
            const y2 = centerY + Math.sin(angle) * (radius + barLength);
            
            const hue = (i / barCount) * 60 + 220;
            ctx.strokeStyle = `hsl(${hue}, 70%, ${50 + percent * 20}%)`;
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const clear = () => {
        if (!ctx || !canvas) return;
        
        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, width, height);
    };

    const setType = (type) => {
        if (['bars', 'wave', 'circle'].includes(type)) {
            visualizerType = type;
        }
    };

    const getType = () => visualizerType;

    const destroy = () => {
        stop();
        window.removeEventListener('resize', resizeCanvas);
    };

    return { init, start, stop, setType, getType, destroy };
})();