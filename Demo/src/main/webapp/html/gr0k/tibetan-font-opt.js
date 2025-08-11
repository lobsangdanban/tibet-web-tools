class TibetanTextOptimizer {
    constructor(options = {}) {
        // 默认配置
        this.options = {
            tibetanFont: 'Noto Serif Tibetan, sans-serif', // 优先使用 Noto Serif Tibetan
            fontSizeScale: 1.2, // 藏文字体放大比例
            baselineOffset: '-0.1em', // 基线向上偏移
            lineHeight: '1.6', // 优化行高
            selector: '.tibetan-text', // 默认选择器
            ...options
        };

        // 藏文 Unicode 范围
        this.tibetanRegex = /[\u0F00-\u0FFF]/;

        // 初始化
        this.init();
    }

    // 初始化方法：扫描 DOM 并处理含藏文的元素
    init() {
        const elements = document.querySelectorAll(this.options.selector);
        elements.forEach(element => this.processElement(element));
    }

    // 处理单个元素
    processElement(element) {
        if (this.containsTibetan(element.textContent)) {
            this.applyTibetanStyles(element);
        } else {
            // 递归处理子节点
            Array.from(element.childNodes).forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    this.processElement(node);
                } else if (node.nodeType === Node.TEXT_NODE && this.containsTibetan(node.textContent)) {
                    this.wrapTibetanText(node);
                }
            });
        }
    }

    // 检查是否包含藏文
    containsTibetan(text) {
        return this.tibetanRegex.test(text);
    }

    // 应用藏文优化样式
    applyTibetanStyles(element) {
        Object.assign(element.style, {
            fontFamily: this.options.tibetanFont,
            fontSize: `${this.options.fontSizeScale}em`,
            verticalAlign: this.options.baselineOffset,
            lineHeight: this.options.lineHeight
        });
    }

    // 包裹藏文文本以应用样式
    wrapTibetanText(textNode) {
        const parent = textNode.parentNode;
        const text = textNode.textContent;
        const span = document.createElement('span');
        span.className = 'tibetan-text-optimized';
        span.textContent = text;
        this.applyTibetanStyles(span);
        parent.replaceChild(span, textNode);
    }

    // 动态更新：当 DOM 变化时重新处理
    observeDOM() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.processElement(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// 使用示例
document.addEventListener('DOMContentLoaded', () => {
    const optimizer = new TibetanTextOptimizer({
        selector: 'p, span, div', // 应用到的元素
        fontSizeScale: 1.25, // 藏文字体放大 1.25 倍
        baselineOffset: '-0.15em', // 基线向上偏移 0.15em
        lineHeight: '1.8' // 行高设置为 1.8
    });

    // 启用 DOM 动态观察
    optimizer.observeDOM();
});