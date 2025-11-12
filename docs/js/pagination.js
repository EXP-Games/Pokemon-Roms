/**
 * 基于 Section 的自动分页系统
 * 功能：
 * 1. 自动隐藏所有系列内容
 * 2. 默认显示第一个系列
 * 3. 点击导航切换系列
 * 4. 只加载当前显示系列的图片（配合懒加载）
 */

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        defaultSection: 'section-01',  // 默认显示的系列
        scrollOffset: 100,              // 滚动偏移量
        animationDuration: 300,         // 动画时长（毫秒）
        localStorageKey: 'lastViewedSection'  // 记住上次浏览的系列
    };

    // 全局状态
    let currentSection = null;
    let allSections = [];
    let sectionContents = new Map();  // 存储每个 section 的内容区域

    /**
     * 初始化分页系统
     */
    function initPagination() {
        console.log('[分页系统] 开始初始化...');

        // 1. 查找所有系列标题
        const sectionHeaders = document.querySelectorAll('h4[id^="section-"]');
        
        if (sectionHeaders.length === 0) {
            console.warn('[分页系统] 未找到任何系列，退出初始化');
            return;
        }

        // 2. 构建系列内容映射
        buildSectionMap(sectionHeaders);

        // 3. 隐藏所有系列（除了默认显示的）
        const initialSection = getInitialSection();
        hideAllSections();
        showSection(initialSection);

        // 4. 修改导航链接行为
        enhanceNavigation();

        // 5. 添加键盘快捷键（可选）
        addKeyboardShortcuts();

        console.log(`[分页系统] 初始化完成，共 ${allSections.length} 个系列`);
        console.log(`[分页系统] 当前显示: ${currentSection}`);
    }

    /**
     * 构建 section 内容映射
     */
    function buildSectionMap(sectionHeaders) {
        sectionHeaders.forEach(header => {
            const sectionId = header.id;
            allSections.push(sectionId);

            // 查找该 section 的所有内容（标题后的 hr 和 container）
            const elements = [];
            let currentElement = header.nextElementSibling;

            // 收集该系列的所有元素，直到遇到下一个系列标题
            while (currentElement) {
                // 如果遇到下一个系列标题，停止
                if (currentElement.tagName === 'H4' && 
                    currentElement.id && 
                    currentElement.id.startsWith('section-')) {
                    break;
                }

                // 如果遇到回到顶部按钮或快速导航，停止
                if (currentElement.id === 'backToTop' || 
                    currentElement.id === 'quickNav') {
                    break;
                }

                elements.push(currentElement);
                currentElement = currentElement.nextElementSibling;
            }

            sectionContents.set(sectionId, {
                header: header,
                elements: elements,
                cardCount: countCards(elements)
            });
        });

        console.log('[分页系统] Section 映射构建完成:', 
            Array.from(sectionContents.entries()).map(([id, data]) => 
                `${id}: ${data.cardCount} 张卡片`
            )
        );
    }

    /**
     * 统计卡片数量
     */
    function countCards(elements) {
        let count = 0;
        elements.forEach(el => {
            if (el.classList && el.classList.contains('container')) {
                count += el.querySelectorAll('.card').length;
            }
        });
        return count;
    }

    /**
     * 获取初始显示的 section
     */
    function getInitialSection() {
        // 1. URL hash 优先级最高
        const hash = window.location.hash.slice(1);
        if (hash && sectionContents.has(hash)) {
            return hash;
        }

        // 2. 尝试读取 localStorage（记住上次浏览的系列）
        try {
            const lastViewed = localStorage.getItem(CONFIG.localStorageKey);
            if (lastViewed && sectionContents.has(lastViewed)) {
                return lastViewed;
            }
        } catch (e) {
            // localStorage 可能被禁用
        }

        // 3. 使用默认系列
        return CONFIG.defaultSection;
    }

    /**
     * 隐藏所有系列
     */
    function hideAllSections() {
        sectionContents.forEach((data, sectionId) => {
            // 隐藏标题
            data.header.style.display = 'none';
            
            // 隐藏所有内容元素
            data.elements.forEach(el => {
                el.style.display = 'none';
            });
        });
    }

    /**
     * 显示指定系列
     */
    function showSection(sectionId, shouldScroll = false) {
        if (!sectionContents.has(sectionId)) {
            console.warn(`[分页系统] Section ${sectionId} 不存在`);
            return;
        }

        // 隐藏当前系列
        if (currentSection && currentSection !== sectionId) {
            const oldData = sectionContents.get(currentSection);
            oldData.header.style.display = 'none';
            oldData.elements.forEach(el => {
                el.style.display = 'none';
            });
        }

        // 显示新系列
        const data = sectionContents.get(sectionId);
        data.header.style.display = 'block';
        data.elements.forEach(el => {
            el.style.display = el.tagName === 'HR' ? 'block' : 
                              el.classList.contains('container') ? 'block' : 'block';
        });

        // 更新当前系列
        currentSection = sectionId;

        // 保存到 localStorage
        try {
            localStorage.setItem(CONFIG.localStorageKey, sectionId);
        } catch (e) {
            // 忽略错误
        }

        // 更新导航高亮
        updateNavHighlight(sectionId);

        // 触发图片懒加载
        triggerLazyLoad();

        // 滚动到顶部（可选）
        if (shouldScroll) {
            setTimeout(() => {
                window.scrollTo({
                    top: data.header.offsetTop - CONFIG.scrollOffset,
                    behavior: 'smooth'
                });
            }, 50);
        }

        // 更新 URL hash（不触发滚动）
        history.replaceState(null, null, '#' + sectionId);

        console.log(`[分页系统] 切换到 ${sectionId}，共 ${data.cardCount} 张卡片`);

        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('sectionChanged', {
            detail: { sectionId, cardCount: data.cardCount }
        }));
    }

    /**
     * 更新导航高亮
     */
    function updateNavHighlight(sectionId) {
        const navLinks = document.querySelectorAll('.nav-link-item');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * 触发懒加载（重新观察当前 section 的图片）
     */
    function triggerLazyLoad() {
        // 通知懒加载系统重新检查可见图片
        if (window.lazyLoadObserver) {
            const currentImages = document.querySelectorAll(`#${currentSection} ~ .container .lazy-load`);
            currentImages.forEach(img => {
                window.lazyLoadObserver.observe(img);
            });
        }
    }

    /**
     * 增强导航链接
     */
    function enhanceNavigation() {
        // 等待导航生成完成
        setTimeout(() => {
            const navLinks = document.querySelectorAll('.nav-link-item');
            
            navLinks.forEach(link => {
                const sectionId = link.getAttribute('href').slice(1);
                
                // 移除原有的点击事件
                link.onclick = function(e) {
                    e.preventDefault();
                    showSection(sectionId, true);
                    return false;
                };
            });

            console.log(`[分页系统] 已增强 ${navLinks.length} 个导航链接`);
        }, 500);  // 等待 navigation.js 执行完成
    }

    /**
     * 添加键盘快捷键
     */
    function addKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // 如果在输入框中，不响应快捷键
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const currentIndex = allSections.indexOf(currentSection);

            // 左箭头或 P：上一个系列
            if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
                if (currentIndex > 0) {
                    showSection(allSections[currentIndex - 1], true);
                }
            }

            // 右箭头或 N：下一个系列
            if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
                if (currentIndex < allSections.length - 1) {
                    showSection(allSections[currentIndex + 1], true);
                }
            }

            // 数字键 1-9：快速跳转到对应系列
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                if (index < allSections.length) {
                    showSection(allSections[index], true);
                }
            }
        });
    }

    /**
     * 添加系列切换按钮（UI）
     */
    function addNavigationButtons() {
        const container = document.querySelector('.container.my-3.sticky-top');
        if (!container) return;

        const navBar = document.createElement('div');
        navBar.className = 'section-navigation-bar';
        navBar.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #2d2d2d 75%, #1a1a1a 100%); border: 2px solid #d4af37; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
                <button id="prevSection" class="btn btn-sm" style="min-width: 120px; background: linear-gradient(135deg, #d4af37, #f4e5a1, #d4af37); color: #000; border: 2px solid #d4af37; font-weight: bold; text-shadow: 0 1px 2px rgba(255,255,255,0.3);">
                    ← 上一个系列
                </button>
                <span id="currentSectionName" style="font-weight: bold; background: linear-gradient(135deg, #d4af37, #f4e5a1, #d4af37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 18px; text-shadow: 0 2px 4px rgba(212, 175, 55, 0.5); filter: drop-shadow(0 2px 4px rgba(212, 175, 55, 0.5));">
                    加载中...
                </span>
                <button id="nextSection" class="btn btn-sm" style="min-width: 120px; background: linear-gradient(135deg, #d4af37, #f4e5a1, #d4af37); color: #000; border: 2px solid #d4af37; font-weight: bold; text-shadow: 0 1px 2px rgba(255,255,255,0.3);">
                    下一个系列 →
                </button>
            </div>
        `;

        container.appendChild(navBar);

        // 绑定事件
        document.getElementById('prevSection').addEventListener('click', () => {
            const currentIndex = allSections.indexOf(currentSection);
            if (currentIndex > 0) {
                showSection(allSections[currentIndex - 1], true);
            }
        });

        document.getElementById('nextSection').addEventListener('click', () => {
            const currentIndex = allSections.indexOf(currentSection);
            if (currentIndex < allSections.length - 1) {
                showSection(allSections[currentIndex + 1], true);
            }
        });

        // 监听系列切换事件，更新按钮状态
        window.addEventListener('sectionChanged', (e) => {
            updateNavigationButtons();
        });

        updateNavigationButtons();
    }

    /**
     * 更新导航按钮状态
     */
    function updateNavigationButtons() {
        const currentIndex = allSections.indexOf(currentSection);
        const prevBtn = document.getElementById('prevSection');
        const nextBtn = document.getElementById('nextSection');
        const nameSpan = document.getElementById('currentSectionName');

        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = currentIndex === allSections.length - 1;
        }

        if (nameSpan && sectionContents.has(currentSection)) {
            const data = sectionContents.get(currentSection);
            const title = data.header.textContent.trim();
            nameSpan.textContent = `${title} (${currentIndex + 1}/${allSections.length})`;
        }
    }

    /**
     * 公开 API
     */
    window.PaginationSystem = {
        showSection: showSection,
        getCurrentSection: () => currentSection,
        getAllSections: () => [...allSections],
        getSectionData: (sectionId) => sectionContents.get(sectionId)
    };

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initPagination();
            addNavigationButtons();
        });
    } else {
        initPagination();
        addNavigationButtons();
    }

})();
