// 音频服务器配置
// 使用说明：将音频文件上传到服务器后，修改下面的服务器地址

export const serverConfig = {
    // 是否使用远程服务器
    useRemoteServer: false, // 改为 true 启用远程服务器
    
    // 服务器基础URL（末尾不要加斜杠）
    // 示例：'https://your-domain.com/music'
    // 示例：'http://192.168.1.100:8080'
    serverBaseUrl: '',
    
    // 如果服务器需要认证，在这里配置
    auth: {
        enabled: false,
        // token: 'your-auth-token', // 取消注释并填写token
        // username: 'your-username',
        // password: 'your-password'
    },
    
    // CORS设置（如果遇到跨域问题）
    cors: {
        // 是否启用CORS代理
        useProxy: false,
        // 代理服务器地址
        proxyUrl: ''
    }
};

// 音频文件路径构建函数
export function getAudioUrl(relativePath) {
    if (serverConfig.useRemoteServer && serverConfig.serverBaseUrl) {
        // 使用远程服务器
        return `${serverConfig.serverBaseUrl}/${relativePath}`;
    } else {
        // 使用本地文件
        return relativePath;
    }
}

// 示例用法：
// import { getAudioUrl } from './config.js';
// const audioSrc = getAudioUrl('assets/audio/歌曲/歌曲.mp3');