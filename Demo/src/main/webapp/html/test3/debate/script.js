// 在 HTML 中添加按钮
// <div id="input-container">
//     <textarea id="logic-input" placeholder="输入藏传因明辩论逻辑"></textarea>
//     <button id="visualize-btn">可视化</button>
//     <button id="undo-btn">撤销</button>
//     <button id="redo-btn">重做</button>
//     <button id="export-btn">导出图片</button>
// </div>

// 在 script.js 中添加功能
// 由于存在重复声明问题，将变量名修改为 historyArr 以避免冲突
let historyArr = [];
// 由于后续已经重新声明了 currentStep，此处注释掉避免重复声明错误
// let currentStep = -1;

document.getElementById('visualize-btn').addEventListener('click', function() {
    try {
        // 清除之前的可视化结果
        d3.select('#logic-tree').selectAll('*').remove();
        d3.select('#heatmap').selectAll('*').remove();

        const inputText = document.getElementById('logic-input').value;
        const parsedLogic = parseLogic(inputText);
        drawLogicTree(parsedLogic);
        drawHeatmap(parsedLogic);
    } catch (error) {
        alert(`发生错误：${error.message}`);
        console.error(error);
    }
});

document.getElementById('undo-btn').addEventListener('click', function() {
    if (currentStep > 0) {
        currentStep--;
        const inputText = document.getElementById('logic-input').value;
        document.getElementById('logic-input').value = history[currentStep];
        // 重新可视化
        const parsedLogic = parseLogic(inputText);
        // 绘制逻辑树
        drawLogicTree(parsedLogic);
        // 绘制归谬路径热力图
        drawHeatmap(parsedLogic);
    }
});

document.getElementById('redo-btn').addEventListener('click', function() {
    if (currentStep < history.length - 1) {
        currentStep++;
        const inputText = document.getElementById('logic-input').value;
        document.getElementById('logic-input').value = history[currentStep];
        // 重新可视化
        const parsedLogic = parseLogic(inputText);
        // 绘制逻辑树
        drawLogicTree(parsedLogic);
        // 绘制归谬路径热力图
        drawHeatmap(parsedLogic);
    }
});

document.getElementById('export-btn').addEventListener('click', function() {
    const svg = d3.select('#logic-tree').select('svg').node();
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = 'logic_tree.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
});

const parseCache = new Map();

function parseLogic(input) {
    if (parseCache.has(input)) {
        return parseCache.get(input);
    }
    const lines = input.split('\n').filter(line => line.trim() !== '');
    const stack = [];
    const root = { name: 'start', children: [] };
    stack.push({ node: root, level: -1 });

    lines.forEach(line => {
        const match = line.match(/^(\s*)(.*)$/);
        const indent = match[1].length;
        const name = match[2].trim();
        const newNode = { name, children: [] };

        while (stack.length > 0 && stack[stack.length - 1].level >= indent) {
            stack.pop();
        }

        const parent = stack[stack.length - 1].node;
        parent.children.push(newNode);
        stack.push({ node: newNode, level: indent });
    });

    parseCache.set(input, root);
    return root;
}

function drawLogicTree(data) {
    const container = document.getElementById('logic-tree');
    // 清除之前的 SVG 元素
    d3.select(container).selectAll('svg').remove(); 

    const svgWidth = container.offsetWidth;
    const svgHeight = container.offsetHeight;

    const svg = d3.select('#logic-tree')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    const g = svg.append('g')
        .attr('transform', 'translate(100,60)'); 

    // 确保 size 设置合理
    const treeLayout = d3.tree().size([svgHeight - 120, svgWidth - 200]);

    const root = d3.hierarchy(data);
    const treeData = treeLayout(root);

    // 绘制连线和节点
    const links = treeData.links();
    const nodes = treeData.descendants();

    function drawLinks(index) {
        if (index < links.length) {
            svg.append('path')
                .attr('class', 'link')
                .attr('d', d3.linkVertical()
                    .x(d => d.y)
                    .y(d => d.x)
                    .apply(null, [links[index]]));
            requestAnimationFrame(() => drawLinks(index + 1));
        }
    }

    function drawNodes(index) {
        if (index < nodes.length) {
            const node = svg.append('g')
                .attr('class', 'node')
                .attr('transform', `translate(${nodes[index].y},${nodes[index].x})`);

            node.append('circle')
                .attr('r', 5);

            node.append('text')
                .attr('dy', '.35em')
                .attr('x', nodes[index].children ? -13 : 13)
                .style('text-anchor', nodes[index].children ? 'end' : 'start')
                .text(nodes[index].data.name);

            requestAnimationFrame(() => drawNodes(index + 1));
        }
    }

    drawLinks(0);
    drawNodes(0);

    // 添加缩放和拖拽功能
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg.call(zoom);
}

function drawHeatmap(data) {
    const container = document.getElementById('heatmap');
    // 清除之前的 SVG 元素
    d3.select(container).selectAll('svg').remove(); 

    const svgWidth = container.offsetWidth;
    const svgHeight = container.offsetHeight;

    const svg = d3.select('#heatmap')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    const testData = Array.from({ length: 10 }, () => 
        Array.from({ length: 10 }, () => Math.random())
    );

    // 确保颜色比例尺的 domain 和数据范围匹配
    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateYlOrRd) 
        .domain([0, 1]); 

    svg.selectAll('rect')
        .data(testData)
        .enter()
        .append('g')
        .selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('x', (d, i) => i * (svgWidth / 10))
        .attr('y', (d, i, j) => j * (svgHeight / 10))
        .attr('width', svgWidth / 10)
        .attr('height', svgHeight / 10)
        .attr('fill', d => colorScale(d)); 

}

// 保存功能
document.getElementById('save-btn').addEventListener('click', function() {
    const inputText = document.getElementById('logic-input').value;
    localStorage.setItem('debateLogic', inputText);
    alert('保存成功！');
});

// 加载功能
document.getElementById('load-btn').addEventListener('click', function() {
    const savedLogic = localStorage.getItem('debateLogic');
    if (savedLogic) {
        document.getElementById('logic-input').value = savedLogic;
        // 重新可视化
        const parsedLogic = parseLogic(savedLogic);
        drawLogicTree(parsedLogic);
        drawHeatmap(parsedLogic);
    } else {
        alert('没有找到保存的数据。');
    }
});

// 在 HTML 中添加按钮
// 在 input-container 中添加
// <button id="save-btn">保存</button>
// <button id="load-btn">加载</button>

// 模拟用户注册
function register(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        alert('用户名已存在！');
    } else {
        users[username] = { password, records: [] };
        localStorage.setItem('users', JSON.stringify(users));
        alert('注册成功！');
    }
}

// 模拟用户登录
function login(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username] && users[username].password === password) {
        alert('登录成功！');
        // 加载用户记录
    } else {
        alert('用户名或密码错误！');
    }
}

const textarea = document.getElementById('logic-input');
const TAB_SPACE_COUNT = 4; // 固定缩进为 4 个空格，可根据需要调整
textarea.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;
        const indent = ' '.repeat(TAB_SPACE_COUNT); // 生成固定数量的空格

        // 插入空格
        this.value = value.substring(0, start) + indent + value.substring(end);
        
        // 移动光标位置
        this.selectionStart = this.selectionEnd = start + indent.length;
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;
        const currentLine = value.substring(0, start).split('\n').pop();
        const indent = currentLine.match(/^\s*/)[0];

        // 插入换行符和缩进
        this.value = value.substring(0, start) + '\n' + indent + value.substring(end);
        
        // 移动光标位置
        this.selectionStart = this.selectionEnd = start + indent.length + 1;
    }
});

// 移除重复的初始化
// let undoStack = [];
// let redoStack = [];

// 移除重复的输入监听
// textarea.addEventListener('input', function() {
//     undoStack.push(this.value);
//     redoStack = []; // 输入新内容时清空重做栈
// });

// 移除重复的撤销按钮事件处理
// document.getElementById('undo-btn').addEventListener('click', function() {
//     if (undoStack.length > 0) {
//         redoStack.push(textarea.value);
//         textarea.value = undoStack.pop();
//         // 重新可视化
//         const parsedLogic = parseLogic(textarea.value);
//         drawLogicTree(parsedLogic);
//         drawHeatmap(parsedLogic);
//     }
// });

// 移除重复的重做按钮事件处理
// document.getElementById('redo-btn').addEventListener('click', function() {
//     if (redoStack.length > 0) {
//         undoStack.push(textarea.value);
//         textarea.value = redoStack.pop();
//         // 重新可视化
//         const parsedLogic = parseLogic(textarea.value);
//         drawLogicTree(parsedLogic);
//         drawHeatmap(parsedLogic);
//     }
// });

// 使用 history 数组的实现，修正逻辑
let history = [];
let currentStep = -1;

// 监听输入框内容变化，保存历史记录
textarea.addEventListener('input', function() {
    // 移除当前步骤之后的历史记录
    history = history.slice(0, currentStep + 1);
    history.push(this.value);
    currentStep++;
});

document.getElementById('undo-btn').addEventListener('click', function() {
    if (currentStep > 0) {
        currentStep--;
        const inputText = history[currentStep];
        document.getElementById('logic-input').value = inputText;
        // 重新可视化
        const parsedLogic = parseLogic(inputText);
        drawLogicTree(parsedLogic);
        drawHeatmap(parsedLogic);
    }
});

document.getElementById('redo-btn').addEventListener('click', function() {
    if (currentStep < history.length - 1) {
        currentStep++;
        const inputText = history[currentStep];
        document.getElementById('logic-input').value = inputText;
        // 重新可视化
        const parsedLogic = parseLogic(inputText);
        drawLogicTree(parsedLogic);
        drawHeatmap(parsedLogic);
    }
});

