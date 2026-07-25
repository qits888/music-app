// 本地存储工具
const STORAGE_PREFIX = 'music-app-';

export const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(STORAGE_PREFIX + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('读取存储失败:', error);
            return defaultValue;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('写入存储失败:', error);
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(STORAGE_PREFIX + key);
            return true;
        } catch (error) {
            console.error('删除存储失败:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(STORAGE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('清空存储失败:', error);
            return false;
        }
    },
    
    has: (key) => {
        return localStorage.getItem(STORAGE_PREFIX + key) !== null;
    }
};

export const savePlaylist = (tracks) => {
    return storage.set('playlist', tracks);
};

export const loadPlaylist = () => {
    return storage.get('playlist', []);
};

export const saveLibrary = (tracks) => {
    return storage.set('library', tracks);
};

export const loadLibrary = () => {
    return storage.get('library', []);
};

export const saveVolume = (volume) => {
    return storage.set('volume', volume);
};

export const loadVolume = () => {
    return storage.get('volume', 0.7);
};

export const savePlayMode = (mode) => {
    return storage.set('playMode', mode);
};

export const loadPlayMode = () => {
    return storage.get('playMode', 'sequence');
};

export const saveFavorites = (favorites) => {
    return storage.set('favorites', favorites);
};

export const loadFavorites = () => {
    return storage.get('favorites', []);
};

export const saveRecent = (recent) => {
    return storage.set('recent', recent);
};

export const loadRecent = () => {
    return storage.get('recent', []);
};