import { Handle, Position } from '@xyflow/react';
import './WorkflowNodes.css';

function StartNode() {
  return (
    <div className="node-card node-inicio">
      <div className="node-header">▶️ Início</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default StartNode;