import { Handle, Position, useReactFlow } from '@xyflow/react';
import './WorkflowNodes.css';

function DelayNode({ id, data }) {
  const { updateNodeData } = useReactFlow();

  return (
    <div className="node-card node-delay">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">⏱️ Aguardar</div>
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