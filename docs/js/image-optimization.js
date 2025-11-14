// 图片加载优化脚本
(function() {
    'use strict';

    // 配置项
    const config = {
        // 是否启用 jsDelivr CDN
        useJsDelivr: false, // GitHub Pages 在国内可能被墙，可以考虑启用
        jsDelivrPrefix: 'https://cdn.jsdelivr.net/gh/EXP-Games/Pokemon-Roms@roms/',
        
        // 是否启用懒加载
        useLazyLoad: true,
        
        // 是否启用图片占位符
        usePlaceholder: true,
        placeholderColor: '#f0f0f0',
        
        // 懒加载配置
        lazyLoadOptions: {
            root: null,
            rootMargin: '50px',
            threshold: 0.01
        }
    };

    // 替换图片 URL 为 CDN
    function convertToCDN(url) {
        if (!config.useJsDelivr) return url;
        
        // 只转换相对路径
        if (url.startsWith('http') || url.startsWith('//')) {
            return url;
        }
        
        // 移除开头的 ./
        const cleanUrl = url.replace(/^\.\//, '');
        return config.jsDelivrPrefix + cleanUrl;
    }

    // 创建图片占位符
    function createPlaceholder(img) {
        const width = img.getAttribute('width') || 100;
        const height = img.getAttribute('height') || 100;
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='${config.placeholderColor}'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' dy='.3em' fill='%23999'%3ELoading...%3C/text%3E%3C/svg%3E`;
    }

    // 懒加载处理
    function setupLazyLoad() {
        if (!config.useLazyLoad || !('IntersectionObserver' in window)) {
            // 不支持懒加载，直接加载所有图片
            loadAllImages();
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, config.lazyLoadOptions);

        // 观察所有图片
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // 加载单个图片
    function loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        // 转换为 CDN URL
        const cdnUrl = convertToCDN(src);
        
        // 创建新图片对象预加载
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = cdnUrl;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        };
        tempImg.onerror = () => {
            console.error('Failed to load image:', cdnUrl);
            // 尝试使用原始 URL
            img.src = src;
            img.classList.add('error');
        };
        tempImg.src = cdnUrl;
    }

    // 加载所有图片（不使用懒加载时）
    function loadAllImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            const src = img.getAttribute('data-src');
            img.src = convertToCDN(src);
            img.removeAttribute('data-src');
        });
    }

    // 初始化图片优化
    function initImageOptimization() {
        // 为现有图片添加懒加载属性
        document.querySelectorAll('img:not([data-src])').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('data:')) {
                img.setAttribute('data-src', src);
                if (config.usePlaceholder) {
                    img.src = createPlaceholder(img);
                }
                img.classList.add('lazy');
            }
        });

        // 启动懒加载
        setupLazyLoad();
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageOptimization);
    } else {
        initImageOptimization();
    }

    // 提供全局控制接口
    window.ImageOptimization = {
        enableCDN: () => {
            config.useJsDelivr = true;
            console.log('CDN enabled');
        },
        disableCDN: () => {
            config.useJsDelivr = false;
            console.log('CDN disabled');
        },
        getConfig: () => config
    };

})();
