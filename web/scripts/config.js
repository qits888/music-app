// 音频服务器配置
// 使用说明：将音频文件上传到服务器后，修改下面的服务器地址

import { loadServerConfig, saveServerConfig } from './utils/storage.js';

// 获取当前配置（每次都从存储读取最新值）
export function getServerConfig() {
    return loadServerConfig();
}

// 更新配置
export function updateServerConfig(newConfig) {
    const currentConfig = loadServerConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    saveServerConfig(updatedConfig);
    console.log('配置已更新:', updatedConfig);
    return updatedConfig;
}

// 音频文件路径构建函数
export function getAudioUrl(relativePath) {
    const config = getServerConfig();
    
    console.log('构建音频URL:', {
        relativePath,
        useRemoteServer: config.useRemoteServer,
        serverBaseUrl: config.serverBaseUrl
    });
    
    if (config.useRemoteServer && config.serverBaseUrl) {
        // 使用远程服务器
        const baseUrl = config.serverBaseUrl.endsWith('/') 
            ? config.serverBaseUrl.slice(0, -1) 
            : config.serverBaseUrl;
        const fullUrl = `${baseUrl}/${relativePath}`;
        console.log('使用远程URL:', fullUrl);
        return fullUrl;
    } else {
        // 使用本地文件
        console.log('使用本地路径:', relativePath);
        return relativePath;
    }
}

// 示例用法：
// import { getAudioUrl } from './config.js';
// const audioSrc = getAudioUrl('assets/audio/歌曲/歌曲.mp3');