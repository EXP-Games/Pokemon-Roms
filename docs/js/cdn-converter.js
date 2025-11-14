/**
 * CDN 转换脚本
 * 自动将图片 URL 转换为 CDN 地址
 */

(function() {
    'use strict';

    // 配置项
    const CONFIG = {
        // 是否启用 CDN（设为 true 启用，false 禁用）
        enabled: true,
        
        // CDN 选项：'jsdelivr', 'cloudflare', 'none'
        provider: 'jsdelivr',
        
        // CDN 前缀配置
        cdnPrefixes: {
            jsdelivr: 'https://cdn.jsdelivr.net/gh/EXP-Games/Pokemon-Roms@roms/',
            cloudflare: 'https://pokemon-roms.pages.dev/', // 需要先配置 Cloudflare Pages
        },
        
        // 调试模式
        debug: false
    };

    // 获取 CDN 前缀
    function getCDNPrefix() {
        return CONFIG.cdnPrefixes[CONFIG.provider] || '';
    }

    // 转换 URL
    function convertURL(url) {
        if (!CONFIG.enabled || !url) return url;
        
        // 跳过已经是完整 URL 的
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
            return url;
        }
        
        // 跳过 data URI
        if (url.startsWith('data:')) {
            return url;
        }
        
        // 转换相对路径
        const cdnPrefix = getCDNPrefix();
        const cleanUrl = url.replace(/^\.\//, ''); // 移除 ./
        const newUrl = cdnPrefix + cleanUrl;
        
        if (CONFIG.debug) {
            console.log(`CDN 转换: ${url} -> ${newUrl}`);
        }
        
        return newUrl;
    }

    // 转换所有图片
    function convertAllImages() {
        if (!CONFIG.enabled) {
            console.log('ℹ️ CDN 转换未启用');
            return;
        }

        let convertedCount = 0;
        
        // 转换普通图片
        document.querySelectorAll('img').forEach(img => {
            // 转换 src
            const src = img.getAttribute('src');
            if (src) {
                const newSrc = convertURL(src);
                if (newSrc !== src) {
                    img.setAttribute('src', newSrc);
                    convertedCount++;
                }
            }
            
            // 转换 data-src（懒加载图片）
            const dataSrc = img.getAttribute('data-src');
            if (dataSrc) {
                const newDataSrc = convertURL(dataSrc);
                if (newDataSrc !== dataSrc) {
                    img.setAttribute('data-src', newDataSrc);
                    convertedCount++;
                }
            }
        });

        // 转换 <a> 标签中的图片链接
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(href)) {
                const newHref = convertURL(href);
                if (newHref !== href) {
                    link.setAttribute('href', newHref);
                    convertedCount++;
                }
            }
        });

        console.log(`✅ CDN 转换完成: ${convertedCount} 个资源已转换为 ${CONFIG.provider}`);
    }

    // 初始化
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', convertAllImages);
        } else {
            convertAllImages();
        }

        // 监听动态添加的图片
        if (CONFIG.enabled && 'MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // 元素节点
                            if (node.tagName === 'IMG') {
                                const src = node.getAttribute('src');
                                if (src) {
                                    node.setAttribute('src', convertURL(src));
                                }
                            }
                            // 检查子元素中的图片
                            node.querySelectorAll && node.querySelectorAll('img').forEach(img => {
                                const src = img.getAttribute('src');
                                if (src) {
                                    img.setAttribute('src', convertURL(src));
                                }
                            });
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // 提供全局控制接口
    window.CDNConverter = {
        enable: function(provider) {
            CONFIG.enabled = true;
            if (provider && CONFIG.cdnPrefixes[provider]) {
                CONFIG.provider = provider;
            }
            convertAllImages();
            console.log(`✅ CDN 已启用: ${CONFIG.provider}`);
        },
        
        disable: function() {
            CONFIG.enabled = false;
            console.log('ℹ️ CDN 已禁用（需要刷新页面生效）');
        },
        
        getConfig: function() {
            return { ...CONFIG };
        },
        
        convert: function(url) {
            return convertURL(url);
        }
    };

    // 启动
    init();

    // 在控制台显示使用提示
    if (CONFIG.debug || !CONFIG.enabled) {
        console.log(`
🚀 CDN 转换脚本已加载

当前状态: ${CONFIG.enabled ? '✅ 已启用' : '⚠️ 未启用'}
CDN 提供商: ${CONFIG.provider}

使用方法:
  CDNConverter.enable('jsdelivr')  - 启用 jsDelivr CDN
  CDNConverter.enable('cloudflare') - 启用 Cloudflare CDN
  CDNConverter.disable()           - 禁用 CDN
  CDNConverter.getConfig()         - 查看配置
  CDNConverter.convert(url)        - 转换单个 URL

提示: 在 cdn-converter.js 中设置 CONFIG.enabled = true 以自动启用
        `);
    }

})();
