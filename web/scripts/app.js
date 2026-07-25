// 应用主入口
import { AudioEngine } from './core/audio-engine.js';
import { StateManager } from './core/state-manager.js';
import { EventBus } from './core/event-bus.js';
import { Player } from './modules/player.js';
import { Playlist } from './modules/playlist.js';
import { Library } from './modules/library.js';
import { Lyrics } from './modules/lyrics.js';
import { Search } from './modules/search.js';
import { Visualizer } from './modules/visualizer.js';
import { $, $$, addClass, removeClass } from './utils/dom.js';
import { loadVolume, saveVolume, loadPlayMode, savePlayMode } from './utils/storage.js';
import { builtInTracks, categories } from './data/tracks.js';

const App = (() => {
    const init = () => {
        console.log('🎵 音乐播放器初始化...');
        
        initCore();
        initModules();
        initUI();
        loadSavedData();
        loadBuiltInTracks();
        
        console.log('✅ 音乐播放器已就绪');
    };

    const initCore = () => {
        AudioEngine.init();
    };

    const initModules = () => {
        Player.init();
        Playlist.init();
        Library.init();
        Lyrics.init();
        Search.init();
        Visualizer.init();
    };

    const initUI = () => {
        initNavigation();
        initViewSwitcher();
        
        EventBus.on('state:change', handleStateChange);
    };

    const initNavigation = () => {
        const navItems = $$('.nav-item, .bottom-nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const view = this.dataset.view;
                switchView(view);
            });
        });
    };

    const initViewSwitcher = () => {
        const views = $$('.view');
        views.forEach(view => view.style.display = 'none');
        
        const playerView = $('#player-view');
        if (playerView) {
            playerView.style.display = 'block';
        }
    };

    const switchView = (viewName) => {
        const views = $$('.view');
        views.forEach(view => {
            view.style.display = view.id === `${viewName}-view` ? 'block' : 'none';
        });
        
        $$('.nav-item, .bottom-nav-item').forEach(item => {
            if (item.dataset.view === viewName) {
                addClass(item, 'active');
            } else {
                removeClass(item, 'active');
            }
        });
        
        StateManager.updateState('ui.activeView', viewName);
        
        if (viewName === 'search') {
            const searchInput = $('#search-input');
            searchInput?.focus();
        }
    };

    const handleStateChange = ({ path, value }) => {
        if (path === 'player.volume') {
            saveVolume(value);
        } else if (path === 'playlist.mode') {
            savePlayMode(value);
        }
    };

    const loadSavedData = () => {
        const volume = loadVolume();
        AudioEngine.setVolume(volume);
        StateManager.updateState('player.volume', volume);
        
        const mode = loadPlayMode();
        StateManager.updateState('playlist.mode', mode);
    };

    const loadBuiltInTracks = () => {
        console.log('加载内置歌曲...');
        
        // 加载分类信息
        if (categories) {
            console.log(`发现 ${categories.length} 个分类`);
        }
        
        builtInTracks.forEach(track => {
            StateManager.addTrackToLibrary(track);
            StateManager.addTrackToPlaylist(track);
        });
        
        console.log(`✅ 已加载 ${builtInTracks.length} 首内置歌曲`);
        
        // 默认加载第一首歌曲信息（不自动播放）
        if (builtInTracks.length > 0) {
            setTimeout(() => {
                const firstTrack = builtInTracks[0];
                StateManager.updateState('playlist.currentIndex', 0);
                StateManager.updateState('player.currentTrack', firstTrack);
            }, 100);
        }
    };

    return { init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}