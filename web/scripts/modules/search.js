// 搜索模块
import { StateManager } from '../core/state-manager.js';
import { EventBus } from '../core/event-bus.js';
import { Player } from './player.js';
import { $, $$, createElement, empty, delegate } from '../utils/dom.js';
import { debounce, highlightText } from '../utils/format.js';
import { getAudioUrl } from '../config.js';

export const Search = (() => {
    let elements = {};
    let searchQuery = '';

    const init = () => {
        cacheElements();
        bindEvents();
    };

    const cacheElements = () => {
        elements = {
            input: $('#search-input'),
            results: $('#search-results')
        };
    };

    const bindEvents = () => {
        if (elements.input) {
            elements.input.addEventListener('input', debounce(handleSearch, 300));
        }
        
        if (elements.results) {
            delegate(elements.results, '.search-result-item', 'click', handleResultClick);
        }
        
        EventBus.on('state:library.tracks', () => {
            if (searchQuery) {
                performSearch(searchQuery);
            }
        });
    };

    const handleSearch = (e) => {
        searchQuery = e.target.value.trim();
        performSearch(searchQuery);
    };

    const performSearch = (query) => {
        if (!elements.results) return;
        
        if (!query) {
            empty(elements.results);
            elements.results.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <p>输入关键词搜索</p>
                </div>
            `;
            return;
        }
        
        const state = StateManager.getState();
        const tracks = state.library.tracks;
        const lowerQuery = query.toLowerCase();
        
        const results = tracks.filter(track => {
            const title = (track.title || '').toLowerCase();
            const artist = (track.artist || '').toLowerCase();
            const album = (track.album || '').toLowerCase();
            
            return title.includes(lowerQuery) || 
                   artist.includes(lowerQuery) || 
                   album.includes(lowerQuery);
        });
        
        renderResults(results, query);
    };

    const renderResults = (results, query) => {
        if (!elements.results) return;
        
        empty(elements.results);
        
        if (results.length === 0) {
            elements.results.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <p>未找到结果</p>
                    <p class="empty-hint">试试其他关键词</p>
                </div>
            `;
            return;
        }
        
        results.forEach(track => {
            const item = createResultItem(track, query);
            elements.results.appendChild(item);
        });
    };

    const createResultItem = (track, query) => {
        const item = createElement('div', {
            class: 'search-result-item playlist-item',
            dataset: { trackId: track.id }
        });
        
        const titleHighlighted = highlightText(track.title || '未知标题', query);
        const artistHighlighted = highlightText(track.artist || '未知艺术家', query);
        const coverUrl = track.cover ? getAudioUrl(track.cover) : '';
        
        item.innerHTML = `
            ${track.cover ? `<img src="${coverUrl}" alt="" class="playlist-item-cover">` : '<div class="playlist-item-cover"></div>'}
            <div class="playlist-item-info">
                <div class="playlist-item-title">${titleHighlighted}</div>
                <div class="playlist-item-artist">${artistHighlighted}</div>
            </div>
        `;
        
        return item;
    };

    const handleResultClick = function() {
        const trackId = this.dataset.trackId;
        const state = StateManager.getState();
        const track = state.library.tracks.find(t => t.id === trackId);
        
        if (track) {
            const existingIndex = state.playlist.tracks.findIndex(t => t.id === trackId);
            
            if (existingIndex === -1) {
                StateManager.addTrackToPlaylist(track);
            }
            
            const index = state.playlist.tracks.findIndex(t => t.id === trackId);
            if (index !== -1) {
                Player.playTrack(index);
            }
        }
    };

    const clear = () => {
        if (elements.input) {
            elements.input.value = '';
            searchQuery = '';
            performSearch('');
        }
    };

    return { init, clear };
})();