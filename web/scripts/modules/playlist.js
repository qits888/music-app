// 播放列表模块
import { StateManager } from '../core/state-manager.js';
import { EventBus } from '../core/event-bus.js';
import { Player } from './player.js';
import { $, $$, createElement, empty, delegate } from '../utils/dom.js';
import { formatTime } from '../utils/format.js';
import { getAudioUrl } from '../config.js';

export const Playlist = (() => {
    let elements = {};

    const init = () => {
        cacheElements();
        bindEvents();
        render();
    };

    const cacheElements = () => {
        elements = {
            container: $('#playlist-container'),
            btnClear: $('#btn-clear-playlist')
        };
    };

    const bindEvents = () => {
        elements.btnClear?.addEventListener('click', clearPlaylist);
        
        if (elements.container) {
            delegate(elements.container, '.playlist-item', 'click', handleTrackClick);
            delegate(elements.container, '.btn-remove', 'click', handleRemoveClick);
        }
        
        EventBus.on('state:playlist.tracks', render);
        EventBus.on('state:playlist.currentIndex', updateActiveTrack);
    };

    const render = () => {
        if (!elements.container) return;
        
        const state = StateManager.getState();
        const { tracks, currentIndex } = state.playlist;
        
        empty(elements.container);
        
        if (tracks.length === 0) {
            elements.container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                    <p>播放列表为空</p>
                    <p class="empty-hint">从音乐库添加音乐</p>
                </div>
            `;
            return;
        }
        
        tracks.forEach((track, index) => {
            const item = createPlaylistItem(track, index, index === currentIndex);
            elements.container.appendChild(item);
        });
    };

    const createPlaylistItem = (track, index, isActive) => {
        const item = createElement('div', {
            class: `playlist-item ${isActive ? 'active' : ''}`,
            dataset: { index }
        });
        
        item.innerHTML = `
            ${track.cover ? `<img src="${track.cover}" alt="" class="playlist-item-cover">` : '<div class="playlist-item-cover"></div>'}
            <div class="playlist-item-info">
                <div class="playlist-item-title">${track.title || '未知标题'}</div>
                <div class="playlist-item-artist">${track.artist || '未知艺术家'}</div>
            </div>
            <div class="playlist-item-duration">${track.duration ? formatTime(track.duration) : '-'}</div>
            <button class="btn-remove" data-index="${index}">
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;
        
        return item;
    };

    const handleTrackClick = function(e) {
        if (e.target.closest('.btn-remove')) return;
        
        const index = parseInt(this.dataset.index, 10);
        Player.playTrack(index);
    };

    const handleRemoveClick = function(e) {
        e.stopPropagation();
        const index = parseInt(this.dataset.index, 10);
        StateManager.removeTrackFromPlaylist(index);
    };

    const clearPlaylist = () => {
        if (confirm('确定要清空播放列表吗？')) {
            StateManager.clearPlaylist();
        }
    };

    const updateActiveTrack = (currentIndex) => {
        if (!elements.container) return;
        
        $$('.playlist-item', elements.container).forEach((item, index) => {
            item.classList.toggle('active', index === currentIndex);
        });
    };

    return { init };
})();