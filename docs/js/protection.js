// 网页保护脚本 - 阻止查看源代码和开发者工具
(function() {
    'use strict';

    // 等待 DOM 加载完成后再执行
    window.addEventListener('DOMContentLoaded', function() {
        
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

        // 3. 开发者工具检测（每10秒检测一次）
        let devtoolsOpen = false;
        const threshold = 160;
        
        const detectDevTools = function() {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
                devtoolsOpen = true;
                // 清空页面内容并显示警告，保留原背景色
                document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:24px;flex-direction:column;"><div style="background:rgba(255,255,255,0.95);padding:40px 60px;border-radius:15px;box-shadow:0 8px 32px rgba(0,0,0,0.3);text-align:center;"><div style="font-size:48px;margin-bottom:20px;">⚠️</div><div style="color:#dc3545;font-weight:bold;margin-bottom:15px;">检测到开发者工具</div><div style="font-size:18px;color:#666;">页面已被禁用，请关闭开发者工具后刷新页面</div></div></div>';
            }
        };
        
        // 每10秒检测一次
        setInterval(detectDevTools, 10000);
        // 初始检测一次
        detectDevTools();

        // 4. 检测调试器（每10秒检测一次）
        let debuggerCheckCount = 0;
        setInterval(function() {
            const startTime = performance.now();
            debugger; // 如果开发者工具打开，这里会暂停
            const endTime = performance.now();
            
            // 如果执行时间过长，说明遇到了 debugger 断点
            if (endTime - startTime > 100) {
                debuggerCheckCount++;
                // 连续检测到2次才执行操作，避免误判
                if (debuggerCheckCount >= 2) {
                    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:24px;flex-direction:column;"><div style="background:rgba(255,255,255,0.95);padding:40px 60px;border-radius:15px;box-shadow:0 8px 32px rgba(0,0,0,0.3);text-align:center;"><div style="font-size:48px;margin-bottom:20px;">⚠️</div><div style="color:#dc3545;font-weight:bold;margin-bottom:15px;">检测到调试器</div><div style="font-size:18px;color:#666;">页面已被禁用</div></div></div>';
                }
            } else {
                debuggerCheckCount = 0; // 重置计数
            }
        }, 10000);

        // 5. 混淆控制台输出（延迟5秒执行，确保页面加载完成）
        setTimeout(function() {
            if (window.console) {
                const noop = function() {};
                console.log = noop;
                console.warn = noop;
                console.error = noop;
                console.info = noop;
                console.debug = noop;
                console.dir = noop;
                console.dirxml = noop;
                console.table = noop;
                console.trace = noop;
                console.group = noop;
                console.groupCollapsed = noop;
                console.groupEnd = noop;
                console.clear = noop;
            }
        }, 5000);

        // 6. 禁用文本选择（可选，已注释以提升用户体验）
        // document.addEventListener('selectstart', function(e) {
        //     e.preventDefault();
        //     return false;
        // });

        // 7. 禁用复制（可选，已注释）
        // document.addEventListener('copy', function(e) {
        //     e.preventDefault();
        //     return false;
        // });

    });

})();
