// 音频引擎 - 音频播放核心
import { EventBus } from './event-bus.js';

export const AudioEngine = (() => {
    let audio = null;
    let audioContext = null;
    let analyser = null;
    let source = null;
    let gainNode = null;
    
    const init = () => {
        audio = new Audio();
        // 只在需要可视化时设置 crossOrigin，避免不必要的 CORS 限制
        // audio.crossOrigin = 'anonymous';
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            gainNode = audioContext.createGain();
            
            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 如果成功创建 AudioContext，才设置 crossOrigin
            audio.crossOrigin = 'anonymous';
        } catch (error) {
            console.warn('Web Audio API 不可用，可视化功能将被禁用', error);
        }
        
        bindEvents();
    };

    const bindEvents = () => {
        audio.addEventListener('loadstart', () => {
            EventBus.emit('audio:loading');
        });

        audio.addEventListener('canplay', () => {
            EventBus.emit('audio:ready', {
                duration: audio.duration
            });
        });

        audio.addEventListener('play', () => {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
            EventBus.emit('audio:play');
        });

        audio.addEventListener('pause', () => {
            EventBus.emit('audio:pause');
        });

        audio.addEventListener('ended', () => {
            EventBus.emit('audio:ended');
        });

        audio.addEventListener('timeupdate', () => {
            EventBus.emit('audio:timeupdate', {
                currentTime: audio.currentTime,
                duration: audio.duration,
                progress: audio.duration ? audio.currentTime / audio.duration : 0
            });
        });

        audio.addEventListener('volumechange', () => {
            EventBus.emit('audio:volumechange', {
                volume: audio.volume,
                muted: audio.muted
            });
        });

        audio.addEventListener('error', (e) => {
            EventBus.emit('audio:error', {
                error: audio.error,
                message: getErrorMessage(audio.error)
            });
        });

        audio.addEventListener('stalled', () => {
            console.warn('音频加载停滞');
        });

        audio.addEventListener('waiting', () => {
            EventBus.emit('audio:buffering');
        });

        audio.addEventListener('playing', () => {
            EventBus.emit('audio:playing');
        });
    };

    const getErrorMessage = (error) => {
        if (!error) return '未知错误';
        
        const errorMessages = {
            1: '音频加载被中止',
            2: '网络错误',
            3: '音频解码失败',
            4: '不支持的音频格式或无法访问音频源'
        };
        
        return errorMessages[error.code] || '音频播放错误';
    };

    const load = async (src) => {
        if (!audio) init();
        
        return new Promise((resolve, reject) => {
            const onCanPlay = () => {
                cleanup();
                resolve();
            };
            
            const onError = (e) => {
                cleanup();
                reject(new Error(getErrorMessage(audio.error)));
            };
            
            const cleanup = () => {
                audio.removeEventListener('canplay', onCanPlay);
                audio.removeEventListener('error', onError);
            };
            
            audio.addEventListener('canplay', onCanPlay, { once: true });
            audio.addEventListener('error', onError, { once: true });
            
            audio.src = src;
            audio.load();
        });
    };

    const play = async () => {
        if (!audio) return;
        
        try {
            await audio.play();
        } catch (error) {
            console.error('播放失败:', error);
            EventBus.emit('audio:error', { error, message: '播放失败，请重试' });
        }
    };

    const pause = () => {
        if (!audio) return;
        audio.pause();
    };

    const stop = () => {
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
    };

    const seek = (time) => {
        if (!audio) return;
        audio.currentTime = Math.max(0, Math.min(time, audio.duration));
    };

    const setVolume = (level) => {
        if (!audio) return;
        audio.volume = Math.max(0, Math.min(1, level));
        
        if (gainNode) {
            gainNode.gain.value = audio.volume;
        }
    };

    const toggleMute = () => {
        if (!audio) return;
        audio.muted = !audio.muted;
        return audio.muted;
    };

    const getCurrentTime = () => {
        return audio ? audio.currentTime : 0;
    };

    const getDuration = () => {
        return audio ? audio.duration : 0;
    };

    const getVolume = () => {
        return audio ? audio.volume : 0;
    };

    const isMuted = () => {
        return audio ? audio.muted : false;
    };

    const isPaused = () => {
        return audio ? audio.paused : true;
    };

    const isEnded = () => {
        return audio ? audio.ended : false;
    };

    const getAnalyser = () => {
        return analyser;
    };

    const getAudioContext = () => {
        return audioContext;
    };

    const destroy = () => {
        if (audio) {
            audio.pause();
            audio.src = '';
            audio = null;
        }
        
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
        
        analyser = null;
        source = null;
        gainNode = null;
    };

    return {
        init,
        load,
        play,
        pause,
        stop,
        seek,
        setVolume,
        toggleMute,
        getCurrentTime,
        getDuration,
        getVolume,
        isMuted,
        isPaused,
        isEnded,
        getAnalyser,
        getAudioContext,
        destroy
    };
})();