let selectedItems = [];
const svg = d3.select("#linkSvg");

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
        
        const maxX = container.offsetWidth - item.offsetWidth;
        const maxY = container.offsetHeight - item.offsetHeight;
        item.style.left = Math.random() * maxX + 'px';
        item.style.top = Math.random() * maxY + 'px';

        container.appendChild(item);
    });

    svg.attr("width", window.innerWidth)
       .attr("height", window.innerHeight);
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
    svg.selectAll("path").remove();

    for (let i = 0; i < selectedItems.length - 1; i++) {
        const startRect = selectedItems[i].getBoundingClientRect();
        const endRect = selectedItems[i + 1].getBoundingClientRect();

        const startPoint = {
            x: startRect.left + startRect.width / 2,
            y: startRect.top + startRect.height / 2
        };
        const endPoint = {
            x: endRect.left + endRect.width / 2,
            y: endRect.top + endRect.height / 2
        };

        const controlPoint = {
            x: (startPoint.x + endPoint.x) / 2 + (endPoint.y - startPoint.y) * 0.3,
            y: (startPoint.y + endPoint.y) / 2 + (startPoint.x - endPoint.x) * 0.3
        };

        const path = d3.path();
        path.moveTo(startPoint.x, startPoint.y);
        path.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);

        svg.append("path")
           .attr("d", path)
           .attr("stroke", "red")
           .attr("stroke-width", 2)
           .attr("fill", "none");
    }
}

window.addEventListener('resize', () => {
    svg.attr("width", window.innerWidth)
       .attr("height", window.innerHeight);
    drawLinks();
});