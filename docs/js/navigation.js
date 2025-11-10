// 自动生成导航链接
function generateNavigation() {
    const sections = document.querySelectorAll('h4[id^="section-"]');
    const navLinks = document.getElementById('navLinks');
    
    sections.forEach(section => {
        // 找到该系列下的所有卡片
        let currentElement = section.nextElementSibling;
        let cardCount = 0;
        
        // 遍历该系列标题后的所有元素，直到遇到下一个系列标题或结束
        while (currentElement) {
            // 如果遇到下一个系列标题，停止计数
            if (currentElement.tagName === 'H4' && currentElement.id && currentElement.id.startsWith('section-')) {
                break;
            }
            
            // 如果是容器 div，统计其中的卡片数量
            if (currentElement.classList && currentElement.classList.contains('container')) {
                cardCount += currentElement.querySelectorAll('.card').length;
            }
            
            currentElement = currentElement.nextElementSibling;
        }
        
        // 创建导航链接
        const link = document.createElement('a');
        link.href = '#' + section.id;
        link.className = 'nav-link-item';
        
        // 创建文本节点和数量徽章
        const titleText = section.textContent.replace('系列', '');
        const textSpan = document.createElement('span');
        textSpan.textContent = titleText;
        
        const countBadge = document.createElement('span');
        countBadge.className = 'nav-count-badge';
        countBadge.textContent = cardCount;
        
        link.appendChild(textSpan);
        link.appendChild(countBadge);
        
        link.onclick = function(e) {
            e.preventDefault();
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        navLinks.appendChild(link);
    });
}

// 回到顶部功能
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 显示/隐藏回到顶部按钮
window.addEventListener('scroll', function() {
    const backToTop = document.getElementById('backToTop');
    if (window.pageYOffset > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

// 页面加载时生成导航
document.addEventListener('DOMContentLoaded', generateNavigation);
