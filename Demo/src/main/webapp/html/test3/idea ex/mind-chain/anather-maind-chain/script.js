let selectedItems = [];
const canvas = document.getElementById('linkCanvas');
const ctx = canvas.getContext('2d');

function processInput() {
    const input = document.getElementById('inputString').value;
    const strings = input.split(' ');
    const container = document.getElementById('stringContainer');
    container.innerHTML = '';

    strings.forEach(str => {
        const item = document.createElement('div');
        item.className = 'string-item';
        item.textContent = str;
        item.addEventListener('click', () => handleItemClick(item));
        
        // 随机位置
        const maxX = container.offsetWidth - item.offsetWidth;
        const maxY = container.offsetHeight - item.offsetHeight;
        item.style.left = Math.random() * maxX + 'px';
        item.style.top = Math.random() * maxY + 'px';

        container.appendChild(item);
    });

    // 调整画布大小以覆盖整个页面
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function handleItemClick(item) {
    if (selectedItems.includes(item)) {
        const index = selectedItems.indexOf(item);
        selectedItems.splice(index, 1);
        item.style.backgroundColor = 'transparent';
    } else {
        selectedItems.push(item);
        item.style.backgroundColor = 'lightblue';
    }

    drawLinks();
}

function getEdgePoint(rect, angle) {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = Math.cos(angle) * (rect.width / 2);
    const dy = Math.sin(angle) * (rect.height / 2);
    return { x: centerX + dx, y: centerY + dy };
}

function drawLinks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    for (let i = 0; i < selectedItems.length - 1; i++) {
        const startRect = selectedItems[i].getBoundingClientRect();
        const endRect = selectedItems[i + 1].getBoundingClientRect();

        const startCenter = {
            x: startRect.left + startRect.width / 2,
            y: startRect.top + startRect.height / 2
        };
        const endCenter = {
            x: endRect.left + endRect.width / 2,
            y: endRect.top + endRect.height / 2
        };

        const angle = Math.atan2(endCenter.y - startCenter.y, endCenter.x - startCenter.x);
        const startPoint = getEdgePoint(startRect, angle);
        const endPoint = getEdgePoint(endRect, angle);

        // 计算控制点
        const controlPoint = {
            x: (startPoint.x + endPoint.x) / 2 + (endPoint.y - startPoint.y) * 0.3,
            y: (startPoint.y + endPoint.y) / 2 + (startPoint.x - endPoint.x) * 0.3
        };

        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
        ctx.stroke();
    }
}

// 监听窗口大小变化事件，调整画布大小
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawLinks();
});