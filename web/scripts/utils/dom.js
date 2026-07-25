// DOM 操作工具
export const $ = (selector, parent = document) => {
    return parent.querySelector(selector);
};

export const $$ = (selector, parent = document) => {
    return Array.from(parent.querySelectorAll(selector));
};

export const createElement = (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'class') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on')) {
            const eventName = key.slice(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });
    
    return element;
};

export const setAttributes = (element, attributes) => {
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
};

export const toggleClass = (element, className, force) => {
    return element.classList.toggle(className, force);
};

export const addClass = (element, ...classNames) => {
    element.classList.add(...classNames);
};

export const removeClass = (element, ...classNames) => {
    element.classList.remove(...classNames);
};

export const hasClass = (element, className) => {
    return element.classList.contains(className);
};

export const show = (element) => {
    element.style.display = '';
};

export const hide = (element) => {
    element.style.display = 'none';
};

export const toggle = (element, force) => {
    if (force === undefined) {
        force = element.style.display === 'none';
    }
    element.style.display = force ? '' : 'none';
};

export const empty = (element) => {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};

export const setHTML = (element, html) => {
    element.innerHTML = html;
};

export const setText = (element, text) => {
    element.textContent = text;
};

export const on = (element, event, handler, options) => {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
};

export const once = (element, event, handler) => {
    element.addEventListener(event, handler, { once: true });
};

export const off = (element, event, handler) => {
    element.removeEventListener(event, handler);
};

export const delegate = (parent, selector, event, handler) => {
    const wrapper = (e) => {
        const target = e.target.closest(selector);
        if (target && parent.contains(target)) {
            handler.call(target, e);
        }
    };
    
    parent.addEventListener(event, wrapper);
    return () => parent.removeEventListener(event, wrapper);
};

export const getOffset = (element) => {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
    };
};

export const animate = (element, keyframes, options) => {
    return element.animate(keyframes, options);
};