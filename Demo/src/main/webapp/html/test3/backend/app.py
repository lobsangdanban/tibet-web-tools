from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# 语音文件存储目录
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Welcome to the Voice Annotation Backend!'})

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        filename = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filename)
        return jsonify({'message': 'File uploaded successfully'}), 200

@app.route('/save-annotation', methods=['POST'])
def save_annotation():
    data = request.get_json()
    # 这里可以将标注数据保存到数据库，暂时打印出来
    print('Received annotation:', data)
    return jsonify({'message': 'Annotation saved successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # 修改端口为 5000