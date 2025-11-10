// 网页保护脚本 - 阻止查看源代码和开发者工具
(function() {
    'use strict';

    // 1. 禁用右键菜单
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // 2. 禁用 F12、Ctrl+Shift+I、Ctrl+Shift+J、Ctrl+U 等快捷键
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+I (开发者工具)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+J (控制台)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+C (元素选择器)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+U (查看源代码)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+S (保存页面)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
    });

    // 3. 检测开发者工具是否打开
    let devtoolsOpen = false;
    const threshold = 160; // 窗口大小差异阈值
    
    const detectDevTools = function() {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                // 可以选择重定向或显示警告
                document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:24px;color:red;">检测到开发者工具，页面已被禁用！</div>';
            }
        } else {
            devtoolsOpen = false;
        }
    };
    
    // 每秒检测一次
    setInterval(detectDevTools, 1000);

    // 4. 禁用文本选择（可选，可能影响用户体验）
    // document.addEventListener('selectstart', function(e) {
    //     e.preventDefault();
    //     return false;
    // });

    // 5. 禁用复制（可选）
    // document.addEventListener('copy', function(e) {
    //     e.preventDefault();
    //     return false;
    // });

    // 6. 检测调试器
    setInterval(function() {
        const startTime = performance.now();
        debugger; // 如果开发者工具打开，这里会暂停
        const endTime = performance.now();
        
        // 如果执行时间过长，说明遇到了 debugger 断点
        if (endTime - startTime > 100) {
            window.location.reload();
        }
    }, 1000);

    // 7. 混淆控制台输出
    if (window.console) {
        console.log = function() {};
        console.warn = function() {};
        console.error = function() {};
        console.info = function() {};
        console.debug = function() {};
    }

})();
