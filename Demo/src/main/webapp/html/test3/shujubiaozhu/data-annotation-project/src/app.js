const AnnotationTool = require('./components/AnnotationTool');

const init = () => {
    const annotationTool = new AnnotationTool();
    annotationTool.loadData();
    annotationTool.render();
    
    // Set up event listeners here
    document.getElementById('submit-button').addEventListener('click', () => {
        annotationTool.handleSubmit();
    });

    document.getElementById('upload-button').addEventListener('click', () => {
        const fileInput = document.getElementById('file-input');
        const preview = document.getElementById('data-preview');

        if (fileInput.files.length === 0) {
            alert('请先选择一个文件！');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const content = event.target.result;
            preview.textContent = content; // 简单显示文件内容
        };

        reader.onerror = () => {
            alert('文件读取失败！');
        };

        reader.readAsText(file);
    });

    document.getElementById('save-annotation-button').addEventListener('click', () => {
        const annotation = document.getElementById('annotation-input').value;
        if (!annotation) {
            alert('请填写标注内容！');
            return;
        }
        alert('标注已保存：' + annotation);
    });
};

document.addEventListener('DOMContentLoaded', init);