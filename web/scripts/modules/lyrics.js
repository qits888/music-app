// 歌词模块 - 支持按音频时长自动校准时间轴
import { StateManager } from '../core/state-manager.js';
import { EventBus } from '../core/event-bus.js';
import { AudioEngine } from '../core/audio-engine.js';
import { $, $$, delegate } from '../utils/dom.js';

export const Lyrics = (() => {
    let elements = {};
    /** @type {{time:number,text:string}[]} */
    let sourceLyrics = [];   // 原始解析结果
    /** @type {{time:number,text:string}[]} */
    let currentLyrics = [];  // 校准后用于显示
    let loadToken = 0;
    let fittedDuration = 0;
    let lyricsOffset = 0;
    let rafId = null;
    let lastActiveIndex = -1;

    const init = () => {
        cacheElements();
        bindEvents();
    };

    const cacheElements = () => {
        elements = {
            panel: $('#lyrics-panel'),
            content: $('#lyrics-content'),
            inline: $('#player-lyrics'),
            btnClose: $('#btn-close-lyrics'),
            btnToggle: $('#btn-lyrics')
        };
    };

    const bindEvents = () => {
        elements.btnClose?.addEventListener('click', hide);
        elements.btnToggle?.addEventListener('click', toggle);

        if (elements.content) {
            delegate(elements.content, '.lyrics-line', 'click', handleLineClick);
        }
        if (elements.inline) {
            delegate(elements.inline, '.lyrics-line', 'click', handleLineClick);
        }

        EventBus.on('player:progress', onProgress);
        EventBus.on('state:player.currentTrack', loadLyrics);
        EventBus.on('audio:ready', onAudioReady);
        EventBus.on('audio:play', startSyncLoop);
        EventBus.on('audio:pause', stopSyncLoop);
        EventBus.on('audio:ended', stopSyncLoop);
    };

    const parseLRC = (lrcText) => {
        if (!lrcText) return [];

        const lyrics = [];
        const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

        lrcText.split(/\r?\n/).forEach((line) => {
            const matches = [...line.matchAll(timeRegex)];
            const text = line.replace(timeRegex, '').trim();

            if (!matches.length || !text) return;
            if (/^(ti|ar|al|by|offset):/i.test(text)) return;

            matches.forEach((match) => {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const fraction = match[3] || '0';
                const ms = parseInt(fraction.padEnd(3, '0').slice(0, 3), 10);
                const time = minutes * 60 + seconds + ms / 1000;
                lyrics.push({ time, text });
            });
        });

        return lyrics.sort((a, b) => a.time - b.time);
    };

    /**
     * 将歌词时间轴拉伸/压缩到真实音频时长
     * 前奏 + 主体 + 尾奏，字数多的行占用稍长
     */
    const fitLyricsToDuration = (lyrics, duration, offset = 0) => {
        if (!lyrics.length) return [];

        // 还没有时长时，先用原始时间 + offset
        if (!duration || !Number.isFinite(duration) || duration <= 0) {
            return lyrics.map((line) => ({
                text: line.text,
                time: Math.max(0, line.time + offset)
            }));
        }

        const intro = clamp(duration * 0.05, 3, 18);
        const outro = clamp(duration * 0.08, 5, 25);
        const usable = Math.max(duration - intro - outro, duration * 0.75);

        // 按字数加权（中文按码点计数）
        const weights = lyrics.map((line) => {
            const len = Array.from(line.text).length;
            return Math.max(len, 5);
        });
        const totalWeight = weights.reduce((sum, w) => sum + w, 0) || 1;

        let cursor = intro;
        return lyrics.map((line, index) => {
            const item = {
                text: line.text,
                time: Math.max(0, Number((cursor + offset).toFixed(2)))
            };

            if (index < lyrics.length - 1) {
                cursor += (usable * weights[index]) / totalWeight;
            }

            return item;
        });
    };

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const encodePath = (url) =>
        url.split('/').map((seg) => encodeURIComponent(seg)).join('/');

    const applyFit = (duration) => {
        if (!sourceLyrics.length) return;

        const nextDuration = duration || AudioEngine.getDuration() || 0;
        if (nextDuration > 0 && Math.abs(nextDuration - fittedDuration) < 0.5) {
            return;
        }

        fittedDuration = nextDuration;
        currentLyrics = fitLyricsToDuration(sourceLyrics, fittedDuration, lyricsOffset);
        StateManager.updateState('lyrics.lines', currentLyrics);
        lastActiveIndex = -1;
        StateManager.updateState('lyrics.currentIndex', -1);
        render(currentLyrics);

        if (fittedDuration > 0) {
            console.log(
                `歌词已校准: ${currentLyrics.length} 行 → ${fittedDuration.toFixed(1)}s`,
                `首句 ${formatClock(currentLyrics[0]?.time)} / 末句 ${formatClock(currentLyrics.at(-1)?.time)}`
            );
        }
    };

    const formatClock = (seconds = 0) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const loadLyrics = async (track) => {
        const token = ++loadToken;
        stopSyncLoop();
        sourceLyrics = [];
        currentLyrics = [];
        fittedDuration = 0;
        lastActiveIndex = -1;
        lyricsOffset = Number(track?.lyricsOffset) || 0;

        if (!track) {
            render([]);
            return;
        }

        let lyrics = [];

        try {
            if (track.lyrics) {
                lyrics = parseLRC(track.lyrics);
            } else if (track.lyricsUrl) {
                const response = await fetch(encodePath(track.lyricsUrl));
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const text = await response.text();

                if (/\[\d{1,2}:\d{2}/.test(text)) {
                    lyrics = parseLRC(text);
                } else {
                    // 纯文本：先给临时时间，等时长到位再校准
                    lyrics = text
                        .split(/\r?\n/)
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line, index) => ({ time: index * 3, text: line }));
                }
            }
        } catch (error) {
            console.error('加载歌词失败:', error);
            lyrics = [];
        }

        if (token !== loadToken) return;

        sourceLyrics = lyrics;
        // 优先：真实播放时长 > 曲目预置时长 > 状态中的时长
        const duration =
            AudioEngine.getDuration() ||
            track.duration ||
            StateManager.getState().player.duration ||
            0;
        applyFit(duration);

        console.log(`歌词已加载: ${track.title} (${sourceLyrics.length} 行)`);

        if (!AudioEngine.isPaused()) {
            startSyncLoop();
        }
    };

    const onAudioReady = ({ duration }) => {
        applyFit(duration);
    };

    const onProgress = ({ currentTime, duration }) => {
        // 若切歌后时长刚就绪，补一次校准
        if (duration > 0 && Math.abs(duration - fittedDuration) > 1) {
            applyFit(duration);
        }
        updateActiveLine(currentTime);
    };

    const startSyncLoop = () => {
        stopSyncLoop();
        const loop = () => {
            if (AudioEngine.isPaused()) {
                rafId = null;
                return;
            }
            updateActiveLine(AudioEngine.getCurrentTime());
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
    };

    const stopSyncLoop = () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    };

    const escapeHtml = (text) =>
        String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

    const createLineHtml = (line, index) =>
        `<div class="lyrics-line" data-index="${index}" data-time="${line.time}">${escapeHtml(line.text)}</div>`;

    const render = (lyrics) => {
        const emptyHtml = '<p class="lyrics-empty">暂无歌词</p>';
        const html = lyrics.length
            ? lyrics.map((line, index) => createLineHtml(line, index)).join('')
            : emptyHtml;

        if (elements.content) {
            elements.content.innerHTML = html;
        }
        if (elements.inline) {
            elements.inline.innerHTML = lyrics.length
                ? `<div class="lyrics-scroll">${html}</div>`
                : emptyHtml;
            elements.inline.classList.toggle('has-lyrics', lyrics.length > 0);
        }
    };

    const updateActiveLine = (currentTime) => {
        if (!currentLyrics.length || !Number.isFinite(currentTime)) return;

        // 二分查找当前行
        let activeIndex = -1;
        let lo = 0;
        let hi = currentLyrics.length - 1;

        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (currentLyrics[mid].time <= currentTime) {
                activeIndex = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }

        if (activeIndex === lastActiveIndex) return;
        lastActiveIndex = activeIndex;
        StateManager.updateState('lyrics.currentIndex', activeIndex);

        const containers = [elements.content, elements.inline].filter(Boolean);
        containers.forEach((container) => {
            const lines = $$('.lyrics-line', container);
            lines.forEach((line, index) => {
                line.classList.toggle('active', index === activeIndex);
            });

            if (activeIndex >= 0 && lines[activeIndex]) {
                scrollLineIntoView(container, lines[activeIndex]);
            }
        });
    };

    // 只滚动歌词容器，避免带动整页
    const scrollLineIntoView = (container, lineEl) => {
        const scroller =
            container.classList?.contains('lyrics-content')
                ? container
                : container.querySelector('.lyrics-scroll') || container;

        if (!scroller || typeof scroller.scrollTo !== 'function') return;

        const scrollerRect = scroller.getBoundingClientRect();
        const lineRect = lineEl.getBoundingClientRect();
        const offset =
            lineRect.top -
            scrollerRect.top -
            scrollerRect.height / 2 +
            lineRect.height / 2 +
            scroller.scrollTop;

        scroller.scrollTo({
            top: Math.max(0, offset),
            behavior: 'smooth'
        });
    };

    const handleLineClick = function () {
        const time = parseFloat(this.dataset.time);
        if (!Number.isFinite(time)) return;
        AudioEngine.seek(time);
        updateActiveLine(time);
    };

    const show = () => {
        elements.panel?.classList.add('active');
        StateManager.updateState('ui.lyricsVisible', true);
    };

    const hide = () => {
        elements.panel?.classList.remove('active');
        StateManager.updateState('ui.lyricsVisible', false);
    };

    const toggle = () => {
        const isVisible = elements.panel?.classList.contains('active');
        isVisible ? hide() : show();
    };

    return { init, show, hide, toggle };
})();