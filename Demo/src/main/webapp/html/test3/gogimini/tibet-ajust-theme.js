
function adjustTibetanText(options = {}) {
    const defaultOptions = {
        targetSelector: 'body',
        fontSize: '1.4em',
        lineHeight: '1.9',
        letterSpacing: '0.02em',
        fontFamily: 'Tibetan Machine Foundational, sans-serif',
        chineseFontFamily: 'Noto Sans SC, sans-serif',
        overrideCss: false, // 新增选项：是否覆盖 CSS
    };
    const mergedOptions = { ...defaultOptions, ...options };
    const targetElements = document.querySelectorAll(mergedOptions.targetSelector);
    targetElements.forEach(element => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (/[༌-࿃]/.test(node.textContent)) {
                const span = document.createElement('span');
                span.className = 'tibetan';
                 if (mergedOptions.overrideCss) {
                    span.style.fontFamily = mergedOptions.fontFamily;
                    span.style.fontSize = mergedOptions.fontSize;
                    span.style.lineHeight = mergedOptions.lineHeight;
                    span.style.letterSpacing = mergedOptions.letterSpacing;
                }
                const parentNode = node.parentNode;
                parentNode.replaceChild(span, node);
                span.appendChild(node);
            }
             else {
                const span = document.createElement('span');
                span.className = 'mixed';
                if (mergedOptions.overrideCss) {
                     span.style.lineHeight = mergedOptions.lineHeight;
                }
                const parentNode = node.parentNode;
                parentNode.replaceChild(span, node);
                span.appendChild(node);
            }
        }
    });
    // 设置中文默认字体
    if (mergedOptions.overrideCss) {
         document.body.style.fontFamily = mergedOptions.chineseFontFamily;
    }

}
// 默认调用：自动调整，不覆盖用户CSS
adjustTibetanText();
// 示例：使用不同字体，并覆盖用户CSS
// adjustTibetanText({ fontFamily: 'Dzongkha, sans-serif', overrideCss: true });
// adjustTibetanText({ fontFamily: 'Kailasa, sans-serif', overrideCss: true });
