// 音乐库模块
import { StateManager } from '../core/state-manager.js';
import { EventBus } from '../core/event-bus.js';
import { $, $$, createElement, empty, delegate } from '../utils/dom.js';
import { categories } from '../data/tracks.js';
import { getAudioUrl } from '../config.js';

export const Library = (() => {
    let elements = {};
    let currentCategory = 'all';

    const init = () => {
        cacheElements();
        renderTabs();
        bindEvents();
        render();
    };

    const cacheElements = () => {
        elements = {
            container: $('#library-container'),
            tabsContainer: $('.library-tabs')
        };
    };

    const renderTabs = () => {
        if (!elements.tabsContainer || !categories) return;
        
        empty(elements.tabsContainer);
        
        categories.forEach((cat, index) => {
            const btn = createElement('button', {
                class: `tab-btn ${index === 0 ? 'active' : ''}`,
                dataset: { category: cat.id }
            });
            
            btn.innerHTML = `${cat.icon || ''} ${cat.name}`;
            elements.tabsContainer.appendChild(btn);
        });
    };

    const bindEvents = () => {
        if (elements.tabsContainer) {
            delegate(elements.tabsContainer, '.tab-btn', 'click', handleTabClick);
        }
        
        if (elements.container) {
            delegate(elements.container, '.library-card', 'click', handleCardClick);
        }
        
        EventBus.on('state:library.tracks', render);
        EventBus.on('state:library.category', render);
    };

    const handleTabClick = function() {
        $$('.library-tabs .tab-btn').forEach(tab => tab.classList.remove('active'));
        this.classList.add('active');
        
        currentCategory = this.dataset.category;
        StateManager.updateState('library.category', currentCategory);
    };

    const render = () => {
        if (!elements.container) return;
        
        const state = StateManager.getState();
        const { tracks, category, recentTracks, favoriteTracks } = state.library;
        
        let filteredTracks = tracks;
        
        if (category === 'recent') {
            filteredTracks = recentTracks
                .map(id => tracks.find(t => t.id === id))
                .filter(Boolean);
        } else if (category === 'favorite') {
            filteredTracks = tracks.filter(t => favoriteTracks.includes(t.id));
        } else if (category !== 'all') {
            // 按分类筛选
            filteredTracks = tracks.filter(t => t.category === category);
        }
        
        empty(elements.container);
        
        if (filteredTracks.length === 0) {
            const categoryName = categories?.find(c => c.id === category)?.name || '此分类';
            elements.container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    <p>${categoryName}暂无歌曲</p>
                    <p class="empty-hint">切换其他分类查看</p>
                </div>
            `;
            return;
        }
        
        filteredTracks.forEach(track => {
            const card = createLibraryCard(track);
            elements.container.appendChild(card);
        });
    };

    const createLibraryCard = (track) => {
        const isFavorite = StateManager.getState().library.favoriteTracks.includes(track.id);
        
        const card = createElement('div', {
            class: 'library-card',
            dataset: { trackId: track.id }
        });
        
        const categoryBadge = track.category ? 
            `<span class="category-badge">${track.category}</span>` : '';
        
        const coverUrl = track.cover ? getAudioUrl(track.cover) : '';
        
        card.innerHTML = `
            ${track.cover ? `<img src="${coverUrl}" alt="" class="library-card-cover">` : '<div class="library-card-cover"></div>'}
            <div class="library-card-info">
                <div class="library-card-title">${track.title || '未知标题'}</div>
                <div class="library-card-artist">${track.artist || '未知艺术家'}</div>
                ${categoryBadge}
            </div>
        `;
        
        return card;
    };

    const handleCardClick = function(e) {
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
                import('./player.js').then(({ Player }) => {
                    Player.playTrack(index);
                });
            }
        }
    };

    return { init };
})();