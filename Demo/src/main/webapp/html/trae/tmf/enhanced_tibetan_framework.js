/**
 * 藏文多语言混编自动调整框架 - 增强版 (支持动态参数配置)
 * Tibetan Multilingual Auto-Adjustment Framework - Enhanced Version
 * 
 * 新增功能：
 * 1. 动态参数配置
 * 2. 配置验证
 * 3. 实时预览
 * 4. 配置导入导出
 * 5. 多套预设方案
 */

(function() {
    'use strict';
    
    // 默认最佳参数配置
    const DEFAULT_SETTINGS = {
        baseSize: 16,
        tibetanRatio: 1.5,
        chineseRatio: 1.0,
        englishRatio: 1.2,
        tibetanBaseline: -3,
        lineHeight: 1.4
    };
    
    // 预设方案
    const PRESET_CONFIGS = {
        default: {
            name: "默认方案",
            settings: { ...DEFAULT_SETTINGS }
        },
        large: {
            name: "大字体方案",
            settings: {
                baseSize: 20,
                tibetanRatio: 1.6,
                chineseRatio: 1.1,
                englishRatio: 1.3,
                tibetanBaseline: -4,
                lineHeight: 1.5
            }
        },
        compact: {
            name: "紧凑方案",
            settings: {
                baseSize: 14,
                tibetanRatio: 1.4,
                chineseRatio: 0.95,
                englishRatio: 1.1,
                tibetanBaseline: -2,
                lineHeight: 1.3
            }
        },
        print: {
            name: "打印方案",
            settings: {
                baseSize: 12,
                tibetanRatio: 1.3,
                chineseRatio: 1.0,
                englishRatio: 1.1,
                tibetanBaseline: -2,
                lineHeight: 1.2
            }
        }
    };
    
    class TibetanAutoFramework {
        constructor(initialSettings = {}) {
            this.settings = { ...DEFAULT_SETTINGS, ...initialSettings };
            this.isProcessing = false;
            this.observer = null;
            this.styleElement = null;
            this.configListeners = [];
            this.init();
        }
        
        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        }
        
        start() {
            console.log('藏文混编自动调整框架已启动 (增强版)', this.settings);
            this.injectStyles();
            this.processAllText();
            this.setupMutationObserver();
        }
        
        // 参数配置相关方法
        
        /**
         * 更新配置参数
         * @param {Object} newSettings - 新的配置参数
         * @param {boolean} immediate - 是否立即应用 (默认true)
         */
        updateSettings(newSettings, immediate = true) {
            const validatedSettings = this.validateSettings(newSettings);
            
            if (validatedSettings.errors.length > 0) {
                console.warn('配置参数验证失败:', validatedSettings.errors);
                return false;
            }
            
            // 备份旧配置
            const oldSettings = { ...this.settings };
            
            // 应用新配置
            Object.assign(this.settings, validatedSettings.settings);
            
            if (immediate) {
                this.applySettings();
            }
            
            // 触发配置变更事件
            this.triggerConfigChange(oldSettings, this.settings);
            
            console.log('配置已更新:', this.settings);
            return true;
        }
        
        /**
         * 验证配置参数
         */
        validateSettings(settings) {
            const errors = [];
            const validatedSettings = {};
            
            // 验证baseSize
            if (settings.baseSize !== undefined) {
                if (typeof settings.baseSize !== 'number' || settings.baseSize < 8 || settings.baseSize > 48) {
                    errors.push('baseSize必须是8-48之间的数字');
                } else {
                    validatedSettings.baseSize = settings.baseSize;
                }
            }
            
            // 验证比例参数
            ['tibetanRatio', 'chineseRatio', 'englishRatio'].forEach(key => {
                if (settings[key] !== undefined) {
                    if (typeof settings[key] !== 'number' || settings[key] < 0.5 || settings[key] > 3) {
                        errors.push(`${key}必须是0.5-3之间的数字`);
                    } else {
                        validatedSettings[key] = settings[key];
                    }
                }
            });
            
            // 验证基线调整
            if (settings.tibetanBaseline !== undefined) {
                if (typeof settings.tibetanBaseline !== 'number' || settings.tibetanBaseline < -20 || settings.tibetanBaseline > 20) {
                    errors.push('tibetanBaseline必须是-20到20之间的数字');
                } else {
                    validatedSettings.tibetanBaseline = settings.tibetanBaseline;
                }
            }
            
            // 验证行高
            if (settings.lineHeight !== undefined) {
                if (typeof settings.lineHeight !== 'number' || settings.lineHeight < 1.0 || settings.lineHeight > 3.0) {
                    errors.push('lineHeight必须是1.0-3.0之间的数字');
                } else {
                    validatedSettings.lineHeight = settings.lineHeight;
                }
            }
            
            return { settings: validatedSettings, errors };
        }
        
        /**
         * 应用配置到DOM
         */
        applySettings() {
            this.injectStyles();
            this.refresh();
        }
        
        /**
         * 使用预设方案
         */
        usePreset(presetName) {
            if (!PRESET_CONFIGS[presetName]) {
                console.error('预设方案不存在:', presetName);
                return false;
            }
            
            return this.updateSettings(PRESET_CONFIGS[presetName].settings);
        }
        
        /**
         * 获取当前配置
         */
        getSettings() {
            return { ...this.settings };
        }
        
        /**
         * 获取所有预设方案
         */
        getPresets() {
            return { ...PRESET_CONFIGS };
        }
        
        /**
         * 导出配置
         */
        exportConfig() {
            return {
                version: '2.0',
                timestamp: new Date().toISOString(),
                settings: this.getSettings()
            };
        }
        
        /**
         * 导入配置
         */
        importConfig(configData) {
            try {
                if (typeof configData === 'string') {
                    configData = JSON.parse(configData);
                }
                
                if (!configData.settings) {
                    throw new Error('配置格式无效');
                }
                
                return this.updateSettings(configData.settings);
            } catch (error) {
                console.error('导入配置失败:', error);
                return false;
            }
        }
        
        /**
         * 重置为默认配置
         */
        resetToDefault() {
            return this.updateSettings(DEFAULT_SETTINGS);
        }
        
        /**
         * 添加配置变更监听器
         */
        onConfigChange(callback) {
            if (typeof callback === 'function') {
                this.configListeners.push(callback);
            }
        }
        
        /**
         * 移除配置变更监听器
         */
        offConfigChange(callback) {
            const index = this.configListeners.indexOf(callback);
            if (index > -1) {
                this.configListeners.splice(index, 1);
            }
        }
        
        /**
         * 触发配置变更事件
         */
        triggerConfigChange(oldSettings, newSettings) {
            this.configListeners.forEach(callback => {
                try {
                    callback(newSettings, oldSettings);
                } catch (error) {
                    console.error('配置变更监听器执行失败:', error);
                }
            });
        }
        
        // 原有方法保持不变，但样式注入使用CSS自定义属性
        
        injectStyles() {
            const styleId = 'tibetan-auto-framework-styles';
            
            // 移除旧样式
            if (this.styleElement) {
                this.styleElement.remove();
            }
            
            this.styleElement = document.createElement('style');
            this.styleElement.id = styleId;
            this.styleElement.textContent = `
                /* 藏文混编自动调整框架增强版样式 */
                :root {
                    --tmf-base-size: ${this.settings.baseSize}px;
                    --tmf-tibetan-size: ${this.settings.baseSize * this.settings.tibetanRatio}px;
                    --tmf-chinese-size: ${this.settings.baseSize * this.settings.chineseRatio}px;
                    --tmf-english-size: ${this.settings.baseSize * this.settings.englishRatio}px;
                    --tmf-tibetan-baseline: ${this.settings.tibetanBaseline}px;
                    --tmf-line-height: ${this.settings.lineHeight};
                }
                
                .tmf-container {
                    font-size: var(--tmf-base-size) !important;
                    line-height: var(--tmf-line-height) !important;
                    font-family: inherit;
                }
                
                .tmf-tibetan {
                    font-family: 'Microsoft Himalaya', 'Jomolhari', 'Tibetan Machine Uni', 'DDC Uchen', 'Monlam Uni Sans Serif', serif !important;
                    font-size: var(--tmf-tibetan-size) !important;
                    position: relative !important;
                    top: var(--tmf-tibetan-baseline) !important;
                    display: inline !important;
                    vertical-align: baseline !important;
                    font-weight: normal !important;
                }
                
                .tmf-chinese {
                    font-family: 'Microsoft YaHei', 'SimHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif !important;
                    font-size: var(--tmf-chinese-size) !important;
                    position: relative !important;
                    top: 0px !important;
                    display: inline !important;
                    vertical-align: baseline !important;
                }
                
                .tmf-english {
                    font-family: 'Times New Roman', 'Georgia', 'Palatino', serif !important;
                    font-size: var(--tmf-english-size) !important;
                    position: relative !important;
                    top: 0px !important;
                    display: inline !important;
                    vertical-align: baseline !important;
                }
                
                .tmf-punctuation {
                    font-size: var(--tmf-base-size) !important;
                    position: relative !important;
                    top: 0px !important;
                    display: inline !important;
                    vertical-align: baseline !important;
                }
                
                .tmf-container * {
                    vertical-align: baseline !important;
                }
                
                /* 调试模式样式 */
                .tmf-debug .tmf-tibetan { background-color: rgba(255, 0, 0, 0.1); }
                .tmf-debug .tmf-chinese { background-color: rgba(0, 255, 0, 0.1); }
                .tmf-debug .tmf-english { background-color: rgba(0, 0, 255, 0.1); }
                .tmf-debug .tmf-punctuation { background-color: rgba(255, 255, 0, 0.1); }
            `;
            
            document.head.appendChild(this.styleElement);
        }
        
        // 原有的核心方法保持不变
        detectCharLanguage(char) {
            const code = char.charCodeAt(0);
            
            if (code >= 0x0F00 && code <= 0x0FFF) return 'tibetan';
            if ((code >= 0x4E00 && code <= 0x9FFF) ||
                (code >= 0x3400 && code <= 0x4DBF) ||
                (code >= 0x20000 && code <= 0x2A6DF) ||
                (code >= 0xF900 && code <= 0xFAFF) ||
                (code >= 0x2F800 && code <= 0x2FA1F)) return 'chinese';
            if ((code >= 0x0041 && code <= 0x005A) ||
                (code >= 0x0061 && code <= 0x007A)) return 'english';
            if ((code >= 0x0030 && code <= 0x0039) ||
                (code >= 0x0020 && code <= 0x002F) ||
                (code >= 0x003A && code <= 0x0040) ||
                (code >= 0x005B && code <= 0x0060) ||
                (code >= 0x007B && code <= 0x007E)) return 'punctuation';
            
            return 'other';
        }
        
        segmentText(text) {
            const segments = [];
            let currentSegment = '';
            let currentType = '';
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const charType = this.detectCharLanguage(char);
                
                if (charType !== currentType) {
                    if (currentSegment) {
                        segments.push({ text: currentSegment, type: currentType });
                    }
                    currentSegment = char;
                    currentType = charType;
                } else {
                    currentSegment += char;
                }
            }
            
            if (currentSegment) {
                segments.push({ text: currentSegment, type: currentType });
            }
            
            return segments;
        }
        
        processTextNode(textNode) {
            const text = textNode.textContent;
            
            const hasTibetan = /[\u0F00-\u0FFF]/.test(text);
            const hasChinese = /[\u4e00-\u9fff]/.test(text);
            const hasEnglish = /[a-zA-Z]/.test(text);
            
            const languageCount = [hasTibetan, hasChinese, hasEnglish].filter(Boolean).length;
            if (languageCount < 2) return;
            
            const segments = this.segmentText(text);
            if (segments.length <= 1) return;
            
            const fragment = document.createDocumentFragment();
            
            segments.forEach(segment => {
                if (segment.text.trim()) {
                    const span = document.createElement('span');
                    
                    switch (segment.type) {
                        case 'tibetan':
                            span.className = 'tmf-tibetan';
                            break;
                        case 'chinese':
                            span.className = 'tmf-chinese';
                            break;
                        case 'english':
                            span.className = 'tmf-english';
                            break;
                        default:
                            span.className = 'tmf-punctuation';
                    }
                    
                    span.textContent = segment.text;
                    fragment.appendChild(span);
                } else if (segment.text) {
                    fragment.appendChild(document.createTextNode(segment.text));
                }
            });
            
            const container = document.createElement('span');
            container.className = 'tmf-container';
            container.appendChild(fragment);
            
            textNode.parentNode.replaceChild(container, textNode);
        }
        
        processAllText() {
            if (this.isProcessing) return;
            
            this.isProcessing = true;
            
            try {
                const walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    {
                        acceptNode: (node) => {
                            if (node.parentNode.closest('.tmf-container') ||
                                node.parentNode.tagName === 'SCRIPT' ||
                                node.parentNode.tagName === 'STYLE') {
                                return NodeFilter.FILTER_REJECT;
                            }
                            
                            return node.textContent.trim() ? 
                                NodeFilter.FILTER_ACCEPT : 
                                NodeFilter.FILTER_REJECT;
                        }
                    }
                );
                
                const textNodes = [];
                let node;
                
                while (node = walker.nextNode()) {
                    textNodes.push(node);
                }
                
                textNodes.forEach(textNode => {
                    try {
                        this.processTextNode(textNode);
                    } catch (error) {
                        console.warn('处理文本节点时出错:', error);
                    }
                });
                
                console.log(`藏文混编框架已处理 ${textNodes.length} 个文本节点`);
                
            } catch (error) {
                console.error('处理文本时出错:', error);
            } finally {
                this.isProcessing = false;
            }
        }
        
        setupMutationObserver() {
            if (this.observer) return;
            
            this.observer = new MutationObserver((mutations) => {
                let hasNewText = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.TEXT_NODE ||
                                (node.nodeType === Node.ELEMENT_NODE && 
                                 !node.closest('.tmf-container'))) {
                                hasNewText = true;
                            }
                        });
                    }
                });
                
                if (hasNewText) {
                    setTimeout(() => {
                        this.processAllText();
                    }, 100);
                }
            });
            
            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        // 调试功能
        
        /**
         * 启用调试模式
         */
        enableDebug() {
            document.body.classList.add('tmf-debug');
            console.log('藏文混编框架调试模式已启用');
        }
        
        /**
         * 禁用调试模式
         */
        disableDebug() {
            document.body.classList.remove('tmf-debug');
            console.log('藏文混编框架调试模式已禁用');
        }
        
        /**
         * 获取处理统计信息
         */
        getStats() {
            const containers = document.querySelectorAll('.tmf-container');
            const tibetanElements = document.querySelectorAll('.tmf-tibetan');
            const chineseElements = document.querySelectorAll('.tmf-chinese');
            const englishElements = document.querySelectorAll('.tmf-english');
            
            return {
                totalContainers: containers.length,
                tibetanSegments: tibetanElements.length,
                chineseSegments: chineseElements.length,
                englishSegments: englishElements.length,
                currentSettings: this.getSettings()
            };
        }
        
        /**
         * 手动重新处理
         */
        refresh() {
            const containers = document.querySelectorAll('.tmf-container');
            containers.forEach(container => {
                const textContent = container.textContent;
                const textNode = document.createTextNode(textContent);
                container.parentNode.replaceChild(textNode, container);
            });
            
            this.processAllText();
        }
        
        /**
         * 销毁框架
         */
        destroy() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            
            if (this.styleElement) {
                this.styleElement.remove();
                this.styleElement = null;
            }
            
            this.refresh();
            this.configListeners = [];
        }
    }
    
    // 创建全局实例
    window.TibetanAutoFramework = TibetanAutoFramework;
    
    // 自动初始化
    const framework = new TibetanAutoFramework();
    
    // 暴露增强的全局API
    window.tmf = {
        // 基础方法
        refresh: () => framework.refresh(),
        destroy: () => framework.destroy(),
        
        // 配置方法
        updateSettings: (settings) => framework.updateSettings(settings),
        getSettings: () => framework.getSettings(),
        resetToDefault: () => framework.resetToDefault(),
        
        // 预设方案
        usePreset: (presetName) => framework.usePreset(presetName),
        getPresets: () => framework.getPresets(),
        
        // 配置导入导出
        exportConfig: () => framework.exportConfig(),
        importConfig: (config) => framework.importConfig(config),
        
        // 调试功能
        enableDebug: () => framework.enableDebug(),
        disableDebug: () => framework.disableDebug(),
        getStats: () => framework.getStats(),
        
        // 事件监听
        onConfigChange: (callback) => framework.onConfigChange(callback),
        offConfigChange: (callback) => framework.offConfigChange(callback)
    };
    
    // 兼容旧版API
    window.tmfRefresh = window.tmf.refresh;
    window.tmfDestroy = window.tmf.destroy;
    window.tmfUpdateSettings = window.tmf.updateSettings;
    
    console.log('藏文混编框架增强版已加载，使用 window.tmf 访问完整API');
    
})();