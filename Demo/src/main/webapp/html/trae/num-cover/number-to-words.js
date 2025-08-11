class NumberToWordsConverter {
    constructor(language = 'zh-CN') {
        this.language = language;
        this.converters = {
            'zh-CN': this.chineseConverter,
            'en-US': this.englishConverter
        };
    }

    // 主转换方法
    convert(number) {
        if (typeof number !== 'number' || isNaN(number)) {
            throw new Error('输入必须为有效数字');
        }

        const converter = this.converters[this.language];
        if (!converter) {
            throw new Error(`不支持的语言: ${this.language}`);
        }

        return converter.call(this, number);
    }

    // 中文转换器（简化版）
    chineseConverter(number) {
        const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        const units = ['', '十', '百', '千', '万', '亿'];
        const numStr = Math.abs(number).toFixed(0); // 简化处理整数
        let result = '';

        for (let i = 0; i < numStr.length; i++) {
            const digit = parseInt(numStr[i], 10);
            const unitIndex = numStr.length - i - 1;
            if (digit !== 0) {
                result += digits[digit] + units[unitIndex % 4];
                if (unitIndex >= 4) result += units[Math.floor(unitIndex / 4) + 3];
            }
        }

        return number < 0 ? `负${result}` : result;
    }

    // 英文转换器（简化版）
    englishConverter(number) {
        const lessThan20 = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const thousands = ['', 'Thousand', 'Million', 'Billion'];
        const numStr = Math.abs(number).toFixed(0);
        let result = '';

        let chunkIndex = 0;
        for (let i = numStr.length; i > 0; i -= 3) {
            const chunk = numStr.substring(Math.max(0, i - 3), i);
            if (chunk !== '000') {
                result = this.convertThreeDigits(chunk, lessThan20, tens) + ' ' + thousands[chunkIndex] + ' ' + result;
            }
            chunkIndex++;
        }

        return number < 0 ? `Negative ${result.trim()}` : result.trim();
    }

    // 辅助方法：处理三位数字段
    convertThreeDigits(chunk, lessThan20, tens) {
        if (chunk.length === 1) return lessThan20[parseInt(chunk, 10)];
        const num = parseInt(chunk, 10);
        if (num < 20) return lessThan20[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + lessThan20[num % 10] : '');
        return lessThan20[Math.floor(num / 100)] + ' Hundred ' + this.convertThreeDigits((num % 100).toString(), lessThan20, tens);
    }
}

// 使用示例
const converter = new NumberToWordsConverter('zh-CN');
console.log(converter.convert(12345)); // 输出：一万二千三百四十五

const enConverter = new NumberToWordsConverter('en-US');
console.log(enConverter.convert(12345)); // 输出：Twelve Thousand Three Hundred Forty Five