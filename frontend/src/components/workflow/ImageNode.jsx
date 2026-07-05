import { Handle, Position, useReactFlow } from '@xyflow/react';
import './WorkflowNodes.css';

function ImageNode({ id, data }) {
  const { updateNodeData, setNodes } = useReactFlow();

  function excluirNo() {
    setNodes((nos) => nos.filter((no) => no.id !== id));
  }

  return (
    <div className="node-card node-imagem">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">
        <span>🖼️ Imagem</span>
        <button className="node-excluir" onClick={excluirNo}>✕</button>
      </div>
      <input
        type="text"
        className="node-input"
        placeholder="URL da imagem"
        value={data.urlImagem || ''}
        onChange={(e) => updateNodeData(id, { urlImagem: e.target.value })}
      />
      <input
        type="text"
        className="node-input"
        placeholder="Legenda (ex: link do site)"
        value={data.legenda || ''}
        onChange={(e) => updateNodeData(id, { legenda: e.target.value })}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default ImageNode;