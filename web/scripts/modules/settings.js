// 设置模块
import { getServerConfig, updateServerConfig } from '../config.js';
import { $ } from '../utils/dom.js';

export const Settings = (() => {
    let elements = {};

    const init = () => {
        cacheElements();
        bindEvents();
        loadSettings();
    };

    const cacheElements = () => {
        elements = {
            useRemoteServer: $('#use-remote-server'),
            serverBaseUrl: $('#server-base-url'),
            btnSaveConfig: $('#btn-save-server-config'),
            btnTestServer: $('#btn-test-server'),
            serverStatus: $('#server-status')
        };
    };

    const bindEvents = () => {
        elements.btnSaveConfig?.addEventListener('click', saveConfig);
        elements.btnTestServer?.addEventListener('click', testConnection);
    };

    const loadSettings = () => {
        const config = getServerConfig();
        
        if (elements.useRemoteServer) {
            elements.useRemoteServer.checked = config.useRemoteServer || false;
        }
        
        if (elements.serverBaseUrl) {
            elements.serverBaseUrl.value = config.serverBaseUrl || '';
        }
    };

    const saveConfig = () => {
        const useRemote = elements.useRemoteServer?.checked || false;
        const baseUrl = elements.serverBaseUrl?.value.trim() || '';

        if (useRemote && !baseUrl) {
            showStatus('请输入服务器地址', 'error');
            return;
        }

        // 移除末尾的斜杠
        const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

        const newConfig = {
            useRemoteServer: useRemote,
            serverBaseUrl: cleanUrl
        };

        updateServerConfig(newConfig);
        showStatus('配置已保存！刷新页面后生效', 'success');

        console.log('服务器配置已更新:', newConfig);
        console.log('当前localStorage:', localStorage.getItem('music-app-serverConfig'));
    };

    const testConnection = async () => {
        const baseUrl = elements.serverBaseUrl?.value.trim() || '';

        if (!baseUrl) {
            showStatus('请先输入服务器地址', 'error');
            return;
        }

        showStatus('正在测试连接...', 'info');

        try {
            // 尝试访问服务器根路径
            const testUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(testUrl, {
                method: 'HEAD',
                signal: controller.signal,
                mode: 'no-cors' // 避免CORS问题
            });

            clearTimeout(timeoutId);
            showStatus('服务器连接成功！', 'success');
        } catch (error) {
            if (error.name === 'AbortError') {
                showStatus('连接超时，请检查服务器地址', 'error');
            } else {
                showStatus('无法连接到服务器（可能存在CORS限制，但不影响使用）', 'warning');
            }
            console.error('测试连接失败:', error);
        }
    };

    const showStatus = (message, type = 'info') => {
        if (!elements.serverStatus) return;

        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        elements.serverStatus.innerHTML = `
            <span style="color: ${colors[type]}; margin-right: 8px;">${icons[type]}</span>
            ${message}
        `;

        // 3秒后清除状态（除了错误）
        if (type !== 'error') {
            setTimeout(() => {
                if (elements.serverStatus) {
                    elements.serverStatus.innerHTML = '';
                }
            }, 3000);
        }
    };

    return { init };
})();