// 音频服务器配置
// 使用说明：将音频文件上传到服务器后，修改下面的服务器地址

import { loadServerConfig, saveServerConfig } from './utils/storage.js';

// 从本地存储加载配置
let serverConfig = loadServerConfig();

// 获取当前配置
export function getServerConfig() {
    return serverConfig;
}

// 更新配置
export function updateServerConfig(newConfig) {
    serverConfig = { ...serverConfig, ...newConfig };
    saveServerConfig(serverConfig);
    return serverConfig;
}

// 音频文件路径构建函数
export function getAudioUrl(relativePath) {
    const config = getServerConfig();
    if (config.useRemoteServer && config.serverBaseUrl) {
        // 使用远程服务器
        const baseUrl = config.serverBaseUrl.endsWith('/') 
            ? config.serverBaseUrl.slice(0, -1) 
            : config.serverBaseUrl;
        return `${baseUrl}/${relativePath}`;
    } else {
        // 使用本地文件
        return relativePath;
    }
}

// 示例用法：
// import { getAudioUrl } from './config.js';
// const audioSrc = getAudioUrl('assets/audio/歌曲/歌曲.mp3');