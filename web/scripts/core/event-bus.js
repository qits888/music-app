// 事件总线 - 解耦模块通信
export const EventBus = (() => {
    const listeners = new Map();

    const on = (event, handler) => {
        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }
        listeners.get(event).add(handler);
        
        return () => off(event, handler);
    };

    const off = (event, handler) => {
        if (listeners.has(event)) {
            listeners.get(event).delete(handler);
        }
    };

    const emit = (event, data) => {
        if (listeners.has(event)) {
            listeners.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`事件处理错误 [${event}]:`, error);
                }
            });
        }
    };

    const once = (event, handler) => {
        const wrapper = (data) => {
            handler(data);
            off(event, wrapper);
        };
        on(event, wrapper);
    };

    return { on, off, emit, once };
})();