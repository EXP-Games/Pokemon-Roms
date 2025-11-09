// 自动生成导航链接
function generateNavigation() {
    const sections = document.querySelectorAll('h4[id^="section-"]');
    const navLinks = document.getElementById('navLinks');
    
    sections.forEach(section => {
        const link = document.createElement('a');
        link.href = '#' + section.id;
        link.className = 'nav-link-item';
        link.textContent = section.textContent.replace('系列', '');
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
