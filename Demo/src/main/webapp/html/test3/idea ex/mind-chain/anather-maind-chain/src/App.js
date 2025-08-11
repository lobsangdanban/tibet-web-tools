import React, { useState } from 'react';
import ReactFlow from 'react-flow-renderer';

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleProcessInput = () => {
    const strings = inputValue.split(' ');
    const newNodes = strings.map((str, index) => ({
      id: `node-${index}`,
      data: { label: str },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    }));
    setNodes(newNodes);
    setEdges([]);
  };

  const handleNodeClick = (event, node) => {
    const selectedNodeIds = edges.map(edge => edge.source).concat(edges.map(edge => edge.target));
    if (selectedNodeIds.includes(node.id)) {
      const newEdges = edges.filter(edge => !edge.source === node.id && !edge.target === node.id);
      setEdges(newEdges);
    } else {
      const newEdges = [...edges, { id: `edge-${edges.length}`, source: node.id, target: `node-${(parseInt(node.id.split('-')[1]) + 1) % nodes.length}` }];
      setEdges(newEdges);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="输入一个或多个字符串，用空格分隔"
      />
      <button onClick={handleProcessInput}>处理输入</button>
      <ReactFlow nodes={nodes} edges={edges} onNodeClick={handleNodeClick} />
    </div>
  );
};

export default App;