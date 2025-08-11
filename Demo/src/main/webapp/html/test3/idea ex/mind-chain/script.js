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

function drawLinks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    for (let i = 0; i < selectedItems.length - 1; i++) {
        const startRect = selectedItems[i].getBoundingClientRect();
        const endRect = selectedItems[i + 1].getBoundingClientRect();

        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;
        const endX = endRect.left + endRect.width / 2;
        const endY = endRect.top + endRect.height / 2;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}

// 监听窗口大小变化事件，调整画布大小
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawLinks();
});