import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function App() {
  const [annotation, setAnnotation] = useState('');
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'audio/*',
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      axios.post('http://localhost:5000/upload', formData)
        .then(response => {
          console.log(response.data);
        })
        .catch(error => {
          console.error(error);
        });
    }
  });

  const handleSaveAnnotation = () => {
    axios.post('http://localhost:5000/save-annotation', { annotation })
      .then(response => {
        console.log(response.data);
        setAnnotation('');
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div className="App">
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <p>拖放语音文件到这里，或点击选择文件</p>
      </div>
      <textarea
        value={annotation}
        onChange={(e) => setAnnotation(e.target.value)}
        placeholder="输入语音标注内容"
      />
      <button onClick={handleSaveAnnotation}>保存标注</button>
    </div>
  );
}

export default App;