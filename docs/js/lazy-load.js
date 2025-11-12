/**
 * 图片懒加载脚本
 * 只在卡片封面进入视口时才加载图片，提升页面初始加载速度
 */

document.addEventListener('DOMContentLoaded', function() {
    // 创建占位符图片（1x1 透明 GIF）
    const placeholderImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    
    // 获取所有卡片中的图片（class="card-img"）
    const cardImages = document.querySelectorAll('.card-img');
    
    // 将所有图片的 src 移动到 data-src，并设置占位符
    cardImages.forEach(img => {
        const realSrc = img.getAttribute('src');
        if (realSrc && !realSrc.startsWith('data:')) {
            img.setAttribute('data-src', realSrc);
            img.setAttribute('src', placeholderImage);
            img.classList.add('lazy-load');
            
            // 添加加载状态样式
            img.style.opacity = '0.3';
            img.style.transition = 'opacity 0.3s ease-in-out';
        }
    });
    
    // 配置 Intersection Observer
    const observerOptions = {
        root: null, // 使用视口作为根元素
        rootMargin: '50px', // 提前 50px 开始加载（用户体验更好）
        threshold: 0.01 // 元素 1% 可见时触发
    };
    
    // 创建 Intersection Observer 实例
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const realSrc = img.getAttribute('data-src');
                
                if (realSrc) {
                    // 创建新的 Image 对象预加载
                    const tempImage = new Image();
                    
                    tempImage.onload = function() {
                        // 图片加载成功后替换 src
                        img.setAttribute('src', realSrc);
                        img.removeAttribute('data-src');
                        img.classList.remove('lazy-load');
                        img.style.opacity = '1';
                        
                        // 停止观察已加载的图片
                        observer.unobserve(img);
                    };
                    
                    tempImage.onerror = function() {
                        // 图片加载失败，显示错误提示
                        console.error('图片加载失败:', realSrc);
                        img.style.opacity = '1';
                        img.alt = '图片加载失败';
                        observer.unobserve(img);
                    };
                    
                    // 开始加载图片
                    tempImage.src = realSrc;
                }
            }
        });
    }, observerOptions);
    
    // 观察所有需要懒加载的图片
    const lazyImages = document.querySelectorAll('.lazy-load');
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
    
    // 性能监控：记录懒加载效果
    console.log(`[懒加载] 已启用图片懒加载，共 ${lazyImages.length} 张图片将按需加载`);
    
    // 提供手动触发加载所有图片的方法（用于调试）
    window.loadAllImages = function() {
        lazyImages.forEach(img => {
            const realSrc = img.getAttribute('data-src');
            if (realSrc) {
                img.setAttribute('src', realSrc);
                img.removeAttribute('data-src');
                img.classList.remove('lazy-load');
                img.style.opacity = '1';
            }
        });
        console.log('[懒加载] 已手动加载所有图片');
    };
});
