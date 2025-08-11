// 开发藏文打字速度测试网页的核心功能类
class TypingTest {
    constructor() {
        // 初始化DOM元素
        this.sampleText = document.getElementById('sample-text'); // 示例文本显示区域
        this.userInput = document.getElementById('user-input');   // 用户输入区域
        this.startButton = document.getElementById('start-test'); // 开始按钮
        
        // 初始化状态变量
        this.isTestActive = false;  // 测试是否进行中
        this.startTime = null;      // 开始时间
        this.errorCount = 0;        // 错误计数
        this.totalChars = 0;        // 总字符数
        this.timerInterval = null;  // 计时器间隔

        // 初始化事件监听
        this.init();
    }

    // 初始化方法
    init() {
        // 禁用粘贴功能，确保用户真实输入
        this.userInput.addEventListener('paste', (e) => e.preventDefault());
        
        // 绑定开始测试按钮事件
        this.startButton.addEventListener('click', () => this.startTest());
        
        // 绑定输入检查事件
        this.userInput.addEventListener('input', () => this.checkInput());
    }

    // 开始测试方法
    startTest() {
        if (this.isTestActive) return; // 如果测试已经在进行中，则返回
        
        // 从样本文本数组中随机选择一段文本
        const randomIndex = Math.floor(Math.random() * sampleTexts.length);
        this.sampleText.textContent = sampleTexts[randomIndex];
        
        // 重置所有状态
        this.userInput.value = '';
        this.userInput.disabled = false;
        this.startButton.textContent = '重新开始';
        this.isTestActive = true;
        this.startTime = new Date();
        this.errorCount = 0;
        this.totalChars = 0;
        
        // 启动计时器
        this.startTimer();
    }

    // 检查输入方法
    checkInput() {
        if (!this.isTestActive) return;
        
        const sampleChars = this.sampleText.textContent.split('');
        const inputChars = this.userInput.value.split('');
        let html = '';
        
        // 逐字符比较并标记颜色
        sampleChars.forEach((char, i) => {
            if (i < inputChars.length) {
                if (char === inputChars[i]) {
                    // 正确字符标绿色
                    html += `<span style="color: green">${char}</span>`;
                } else {
                    // 错误字符标红色
                    html += `<span style="color: red">${char}</span>`;
                    this.errorCount++;
                }
            } else {
                // 未输入的字符保持原色
                html += char;
            }
        });
        
        this.sampleText.innerHTML = html;
        this.totalChars = inputChars.length;
        
        // 更新统计数据
        this.updateStats();
        
        // 检查是否完成测试
        if (inputChars.length === sampleChars.length) {
            this.endTest();
        }
    }

    // 更新统计数据方法
    updateStats() {
        // 计算正确率和错误率
        const accuracy = ((this.totalChars - this.errorCount) / this.totalChars * 100) || 0;
        const errorRate = (this.errorCount / this.totalChars * 100) || 0;
        
        // 更新显示
        document.getElementById('accuracy').textContent = `${accuracy.toFixed(2)}%`;
        document.getElementById('error-rate').textContent = `${errorRate.toFixed(2)}%`;
    }

    // 启动计时器方法
    startTimer() {
        const timerElement = document.getElementById('time-spent');
        const startTime = new Date();
        
        // 每秒更新一次时间显示
        this.timerInterval = setInterval(() => {
            const currentTime = new Date();
            const timeDiff = new Date(currentTime - startTime);
            const minutes = timeDiff.getMinutes();
            const seconds = timeDiff.getSeconds();
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }, 1000);
    }

    // 结束测试方法
    endTest() {
        this.isTestActive = false;
        this.userInput.disabled = true;
        this.startButton.textContent = '开始测试';
        clearInterval(this.timerInterval);
        
        // 计算最终统计数据
        const endTime = new Date();
        const timeSpent = (endTime - this.startTime) / 1000; // 转换为秒
        const wordsPerMinute = (this.totalChars / 5) / (timeSpent / 60);
        
        // 显示最终结果
        alert(`测试完成!\n
            用时: ${timeSpent.toFixed(2)}秒\n
            打字速度: ${wordsPerMinute.toFixed(2)} WPM\n
            正确率: ${((this.totalChars - this.errorCount) / this.totalChars * 100).toFixed(2)}%`);
    }
}

// 创建TypingTest实例
const typingTest = new TypingTest();


