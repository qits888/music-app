// 状态管理器 - 统一状态管理
import { EventBus } from './event-bus.js';

export const StateManager = (() => {
    const state = {
        player: {
            status: 'idle',           // idle, loading, ready, playing, paused, error
            currentTrack: null,
            progress: 0,
            duration: 0,
            volume: 0.7,
            muted: false
        },
        playlist: {
            tracks: [],
            currentIndex: -1,
            mode: 'sequence'          // sequence, random, repeat-one
        },
        library: {
            tracks: [],
            category: 'all',          // all, recent, favorite
            recentTracks: [],
            favoriteTracks: []
        },
        lyrics: {
            lines: [],
            currentIndex: -1
        },
        ui: {
            activeView: 'player',
            lyricsVisible: false
        }
    };

    const getState = () => state;

    const updateState = (path, value) => {
        const keys = path.split('.');
        let target = state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            target = target[keys[i]];
        }
        
        const lastKey = keys[keys.length - 1];
        const oldValue = target[lastKey];
        
        if (oldValue !== value) {
            target[lastKey] = value;
            EventBus.emit('state:change', { path, value, oldValue });
            EventBus.emit(`state:${path}`, value);
        }
    };

    const batchUpdate = (updates) => {
        updates.forEach(({ path, value }) => {
            const keys = path.split('.');
            let target = state;
            
            for (let i = 0; i < keys.length - 1; i++) {
                target = target[keys[i]];
            }
            
            target[keys[keys.length - 1]] = value;
        });
        
        EventBus.emit('state:batch-change', updates);
    };

    const addTrackToPlaylist = (track) => {
        state.playlist.tracks.push(track);
        EventBus.emit('playlist:track-added', track);
        EventBus.emit('state:playlist.tracks', state.playlist.tracks);
    };

    const removeTrackFromPlaylist = (index) => {
        const removed = state.playlist.tracks.splice(index, 1)[0];
        
        if (state.playlist.currentIndex === index) {
            state.playlist.currentIndex = -1;
        } else if (state.playlist.currentIndex > index) {
            state.playlist.currentIndex--;
        }
        
        EventBus.emit('playlist:track-removed', { track: removed, index });
        EventBus.emit('state:playlist.tracks', state.playlist.tracks);
    };

    const clearPlaylist = () => {
        state.playlist.tracks = [];
        state.playlist.currentIndex = -1;
        EventBus.emit('playlist:cleared');
        EventBus.emit('state:playlist.tracks', state.playlist.tracks);
    };

    const addTrackToLibrary = (track) => {
        const existingIndex = state.library.tracks.findIndex(t => t.id === track.id);
        
        if (existingIndex === -1) {
            state.library.tracks.push(track);
            EventBus.emit('library:track-added', track);
            EventBus.emit('state:library.tracks', state.library.tracks);
        }
    };

    const toggleFavorite = (trackId) => {
        const index = state.library.favoriteTracks.indexOf(trackId);
        
        if (index === -1) {
            state.library.favoriteTracks.push(trackId);
        } else {
            state.library.favoriteTracks.splice(index, 1);
        }
        
        EventBus.emit('library:favorite-toggled', trackId);
    };

    const addToRecent = (trackId) => {
        const index = state.library.recentTracks.indexOf(trackId);
        
        if (index !== -1) {
            state.library.recentTracks.splice(index, 1);
        }
        
        state.library.recentTracks.unshift(trackId);
        
        if (state.library.recentTracks.length > 50) {
            state.library.recentTracks.pop();
        }
        
        EventBus.emit('library:recent-updated', state.library.recentTracks);
    };

    return {
        getState,
        updateState,
        batchUpdate,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        clearPlaylist,
        addTrackToLibrary,
        toggleFavorite,
        addToRecent
    };
})();