// 修改导入方式
import * as opentype from './opentype.js';

// 异步加载藏文字体文件，并处理错误
async function loadFont() {
    try {
        // 替换为实际的藏文字体文件路径
        return await opentype.load('e:/study/html/test3/himalaya_0.ttf'); 
    } catch (error) {
        console.error('字体加载失败:', error);
        return null;
    }
}

let font = null;
loadFont().then(loadedFont => {
    font = loadedFont;
});

function textToPath(text) {
    if (!font) {
        console.error('字体未加载完成，请稍后再试。');
        return null;
    }
    const path = new opentype.Path();
    font.forEachGlyph(text, 0, 0, 72, {
        onGlyph: (glyph, x, y) => {
            glyph.draw(path, x, y);
        }
    });
    return path;
}

function pathToGcode(path) {
    if (!path) {
        return '';
    }
    let gcode = '';
    // 遍历路径的命令，生成 G-code
    path.commands.forEach(command => {
        switch (command.type) {
            case 'M': // 移动到指定位置
                gcode += `G0 X${command.x} Y${command.y}\n`;
                break;
            case 'L': // 直线绘制到指定位置
                gcode += `G1 X${command.x} Y${command.y}\n`;
                break;
            case 'Q': // 二次贝塞尔曲线
                gcode += `G5 X${command.x} Y${command.y} I${command.x1} J${command.y1}\n`;
                break;
            case 'C': // 三次贝塞尔曲线
                gcode += `G5 X${command.x} Y${command.y} I${command.x1} J${command.y1} K${command.x2} L${command.y2}\n`;
                break;
            case 'Z': // 闭合路径
                gcode += 'G1 Z0\n'; // 假设抬笔高度为 0
                break;
            default:
                console.warn('未知路径命令类型:', command.type);
        }
    });
    return gcode;
}