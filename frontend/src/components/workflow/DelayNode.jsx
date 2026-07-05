import { Handle, Position, useReactFlow } from '@xyflow/react';
import './WorkflowNodes.css';

function DelayNode({ id, data }) {
  const { updateNodeData, setNodes } = useReactFlow();

  function excluirNo() {
    setNodes((nos) => nos.filter((no) => no.id !== id));
  }

  return (
    <div className="node-card node-delay">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">
        <span>⏱️ Aguardar</span>
        <button className="node-excluir" onClick={excluirNo}>✕</button>
      </div>
      <div className="node-delay-input">
        <input
          type="number"
          min="1"
          value={data.segundos || 3}
          onChange={(e) => updateNodeData(id, { segundos: Number(e.target.value) })}
        />
        <span>segundos</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default DelayNode;