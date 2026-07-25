// 播放器模块
import { AudioEngine } from '../core/audio-engine.js';
import { StateManager } from '../core/state-manager.js';
import { EventBus } from '../core/event-bus.js';
import { $, addClass, removeClass, toggleClass } from '../utils/dom.js';
import { formatTime } from '../utils/format.js';
import { getAudioUrl } from '../config.js';

export const Player = (() => {
    let elements = {};
    let isDraggingProgress = false;
    let isDraggingVolume = false;

    const init = () => {
        cacheElements();
        bindEvents();
        loadInitialState();
    };

    const cacheElements = () => {
        elements = {
            coverImage: $('#cover-image'),
            coverPlaceholder: $('.cover-placeholder'),
            trackTitle: $('#track-title'),
            trackArtist: $('#track-artist'),
            timeCurrent: $('#time-current'),
            timeDuration: $('#time-duration'),
            progressBar: $('#progress-bar'),
            progressFill: $('#progress-fill'),
            progressHandle: $('#progress-handle'),
            btnPlay: $('#btn-play'),
            btnPrev: $('#btn-prev'),
            btnNext: $('#btn-next'),
            btnMode: $('#btn-mode'),
            btnVolume: $('#btn-volume'),
            volumeBar: $('#volume-bar'),
            volumeFill: $('#volume-fill'),
            volumeHandle: $('#volume-handle'),
            iconPlay: $('.icon-play', elements.btnPlay),
            iconPause: $('.icon-pause', elements.btnPlay),
            miniPlayer: $('.mini-player'),
            miniCover: $('#mini-cover'),
            miniTitle: $('#mini-title'),
            miniArtist: $('#mini-artist'),
            miniBtnPlay: $('#mini-btn-play'),
            miniBtnNext: $('#mini-btn-next'),
            miniProgress: $('#mini-progress')
        };
    };

    const bindEvents = () => {
        elements.btnPlay?.addEventListener('click', togglePlay);
        elements.miniBtnPlay?.addEventListener('click', togglePlay);
        elements.btnPrev?.addEventListener('click', playPrevious);
        elements.btnNext?.addEventListener('click', playNext);
        elements.miniBtnNext?.addEventListener('click', playNext);
        elements.btnMode?.addEventListener('click', cyclePlayMode);
        elements.btnVolume?.addEventListener('click', toggleMute);
        
        elements.progressBar?.addEventListener('mousedown', startDragProgress);
        elements.progressBar?.addEventListener('click', seekByClick);
        
        elements.volumeBar?.addEventListener('mousedown', startDragVolume);
        elements.volumeBar?.addEventListener('click', setVolumeByClick);
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
        
        EventBus.on('audio:ready', handleAudioReady);
        EventBus.on('audio:play', handleAudioPlay);
        EventBus.on('audio:pause', handleAudioPause);
        EventBus.on('audio:timeupdate', handleTimeUpdate);
        EventBus.on('audio:ended', handleAudioEnded);
        EventBus.on('audio:error', handleAudioError);
        EventBus.on('state:player.currentTrack', updateTrackInfo);
    };

    const loadInitialState = () => {
        const state = StateManager.getState();
        updatePlayModeUI(state.playlist.mode);
        updateVolumeUI(state.player.volume);
    };

    const togglePlay = () => {
        const state = StateManager.getState();
        
        if (!state.player.currentTrack) {
            if (state.playlist.tracks.length > 0) {
                playTrack(0);
            }
            return;
        }
        
        if (AudioEngine.isPaused()) {
            AudioEngine.play();
        } else {
            AudioEngine.pause();
        }
    };

    const playTrack = async (index) => {
        const state = StateManager.getState();
        const track = state.playlist.tracks[index];
        
        if (!track) return;
        
        try {
            StateManager.updateState('player.status', 'loading');
            StateManager.updateState('playlist.currentIndex', index);
            StateManager.updateState('player.currentTrack', track);
            
            // 使用配置的URL加载音频
            const audioUrl = getAudioUrl(track.src);
            console.log('加载音频:', audioUrl);
            
            await AudioEngine.load(audioUrl);
            await AudioEngine.play();
            
            StateManager.addToRecent(track.id);
        } catch (error) {
            console.error('播放失败:', error);
            StateManager.updateState('player.status', 'error');
        }
    };

    const playPrevious = () => {
        const state = StateManager.getState();
        const { tracks, currentIndex, mode } = state.playlist;
        
        if (tracks.length === 0) return;
        
        let nextIndex;
        
        if (mode === 'random') {
            nextIndex = Math.floor(Math.random() * tracks.length);
        } else {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
                nextIndex = tracks.length - 1;
            }
        }
        
        playTrack(nextIndex);
    };

    const playNext = () => {
        const state = StateManager.getState();
        const { tracks, currentIndex, mode } = state.playlist;
        
        if (tracks.length === 0) return;
        
        let nextIndex;
        
        if (mode === 'repeat-one') {
            nextIndex = currentIndex;
        } else if (mode === 'random') {
            nextIndex = Math.floor(Math.random() * tracks.length);
        } else {
            nextIndex = currentIndex + 1;
            if (nextIndex >= tracks.length) {
                nextIndex = 0;
            }
        }
        
        playTrack(nextIndex);
    };

    const cyclePlayMode = () => {
        const state = StateManager.getState();
        const modes = ['sequence', 'random', 'repeat-one'];
        const currentMode = state.playlist.mode;
        const nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
        const nextMode = modes[nextIndex];
        
        StateManager.updateState('playlist.mode', nextMode);
        updatePlayModeUI(nextMode);
    };

    const updatePlayModeUI = (mode) => {
        const modeIcons = {
            sequence: '<path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/>',
            random: '<path d="M21 16V8M2 16h7l4-8 4 8h7M17 4l4 4-4 4"/>',
            'repeat-one': '<path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/><text x="12" y="16" text-anchor="middle" font-size="8" fill="currentColor">1</text>'
        };
        
        if (elements.btnMode) {
            elements.btnMode.innerHTML = `<svg viewBox="0 0 24 24">${modeIcons[mode]}</svg>`;
            elements.btnMode.title = {
                sequence: '顺序播放',
                random: '随机播放',
                'repeat-one': '单曲循环'
            }[mode];
        }
    };

    const toggleMute = () => {
        const muted = AudioEngine.toggleMute();
        StateManager.updateState('player.muted', muted);
        updateMuteUI(muted);
    };

    const updateMuteUI = (muted) => {
        if (elements.btnVolume) {
            const iconHigh = $('.icon-volume-high', elements.btnVolume);
            const iconMute = $('.icon-volume-mute', elements.btnVolume);
            
            if (iconHigh && iconMute) {
                iconHigh.style.display = muted ? 'none' : 'block';
                iconMute.style.display = muted ? 'block' : 'none';
            }
        }
    };

    const startDragProgress = (e) => {
        isDraggingProgress = true;
        seekByClick(e);
    };

    const startDragVolume = (e) => {
        isDraggingVolume = true;
        setVolumeByClick(e);
    };

    const handleDrag = (e) => {
        if (isDraggingProgress) {
            seekByClick(e);
        } else if (isDraggingVolume) {
            setVolumeByClick(e);
        }
    };

    const stopDrag = () => {
        isDraggingProgress = false;
        isDraggingVolume = false;
    };

    const seekByClick = (e) => {
        if (!elements.progressBar) return;
        
        const rect = elements.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * AudioEngine.getDuration();
        
        AudioEngine.seek(time);
    };

    const setVolumeByClick = (e) => {
        if (!elements.volumeBar) return;
        
        const rect = elements.volumeBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        
        AudioEngine.setVolume(percent);
        StateManager.updateState('player.volume', percent);
        updateVolumeUI(percent);
    };

    const updateVolumeUI = (volume) => {
        if (elements.volumeFill && elements.volumeHandle) {
            const percent = volume * 100;
            elements.volumeFill.style.width = `${percent}%`;
            elements.volumeHandle.style.left = `${percent}%`;
        }
    };

    const handleAudioReady = ({ duration }) => {
        StateManager.updateState('player.status', 'ready');
        StateManager.updateState('player.duration', duration);
        
        if (elements.timeDuration) {
            elements.timeDuration.textContent = formatTime(duration);
        }
    };

    const handleAudioPlay = () => {
        StateManager.updateState('player.status', 'playing');
        updatePlayButtonUI(true);
    };

    const handleAudioPause = () => {
        StateManager.updateState('player.status', 'paused');
        updatePlayButtonUI(false);
    };

    const updatePlayButtonUI = (isPlaying) => {
        [elements.btnPlay, elements.miniBtnPlay].forEach(btn => {
            if (!btn) return;
            
            const iconPlay = $('.icon-play', btn);
            const iconPause = $('.icon-pause', btn);
            
            if (iconPlay && iconPause) {
                iconPlay.style.display = isPlaying ? 'none' : 'block';
                iconPause.style.display = isPlaying ? 'block' : 'none';
            }
        });
    };

    const handleTimeUpdate = ({ currentTime, duration, progress }) => {
        StateManager.updateState('player.progress', progress);
        
        if (!isDraggingProgress) {
            if (elements.timeCurrent) {
                elements.timeCurrent.textContent = formatTime(currentTime);
            }
            
            if (elements.progressFill && elements.progressHandle) {
                const percent = progress * 100;
                elements.progressFill.style.width = `${percent}%`;
                elements.progressHandle.style.left = `${percent}%`;
            }
            
            if (elements.miniProgress) {
                elements.miniProgress.style.width = `${progress * 100}%`;
            }
        }
        
        EventBus.emit('player:progress', { currentTime, duration, progress });
    };

    const handleAudioEnded = () => {
        playNext();
    };

    const handleAudioError = ({ message }) => {
        StateManager.updateState('player.status', 'error');
        console.error('音频错误:', message);
        alert(`播放错误: ${message}`);
    };

    const updateTrackInfo = (track) => {
        if (!track) return;
        
        if (elements.trackTitle) {
            elements.trackTitle.textContent = track.title || '未知标题';
        }
        
        if (elements.trackArtist) {
            elements.trackArtist.textContent = track.artist || '未知艺术家';
        }
        
        if (elements.coverImage) {
            if (track.cover) {
                // 使用配置的URL加载封面
                elements.coverImage.src = getAudioUrl(track.cover);
                elements.coverImage.style.display = 'block';
                if (elements.coverPlaceholder) {
                    elements.coverPlaceholder.style.display = 'none';
                }
            } else {
                elements.coverImage.style.display = 'none';
                if (elements.coverPlaceholder) {
                    elements.coverPlaceholder.style.display = 'flex';
                }
            }
        }
        
        if (elements.miniTitle) {
            elements.miniTitle.textContent = track.title || '未知标题';
        }
        
        if (elements.miniArtist) {
            elements.miniArtist.textContent = track.artist || '未知艺术家';
        }
        
        if (elements.miniCover && track.cover) {
            elements.miniCover.src = getAudioUrl(track.cover);
        }
    };

    return { init, playTrack };
})();