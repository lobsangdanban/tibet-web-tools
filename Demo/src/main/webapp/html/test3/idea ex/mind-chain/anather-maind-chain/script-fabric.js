let selectedItems = [];
const canvas = new fabric.Canvas('linkCanvas');

function processInput() {
    const input = document.getElementById('inputString').value;
    const strings = input.split(' ');
    canvas.clear();

    strings.forEach(str => {
        const text = new fabric.Textbox(str, {
            left: Math.random() * (canvas.width - 100),
            top: Math.random() * (canvas.height - 50),
            width: 100,
            hasControls: false,
            hasBorders: false,
        });
        text.on('selected', () => handleItemClick(text));
        canvas.add(text);
    });
}

function handleItemClick(item) {
    if (selectedItems.includes(item)) {
        const index = selectedItems.indexOf(item);
        selectedItems.splice(index, 1);
        item.set('fill', 'black');
    } else {
        selectedItems.push(item);
        item.set('fill', 'lightblue');
    }
    canvas.renderAll();
    drawLinks();
}

function drawLinks() {
    const existingLines = canvas.getObjects('line');
    existingLines.forEach(line => canvas.remove(line));

    for (let i = 0; i < selectedItems.length - 1; i++) {
        const startRect = selectedItems[i].getBoundingRect();
        const endRect = selectedItems[i + 1].getBoundingRect();

        const startPoint = {
            x: startRect.left + startRect.width / 2,
            y: startRect.top + startRect.height / 2
        };
        const endPoint = {
            x: endRect.left + endRect.width / 2,
            y: endRect.top + endRect.height / 2
        };

        const line = new fabric.Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
            stroke: 'red',
            strokeWidth: 2,
        });
        canvas.add(line);
    }
}

window.addEventListener('resize', () => {
    canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    drawLinks();
});