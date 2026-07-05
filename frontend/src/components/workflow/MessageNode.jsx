import { Handle, Position, useReactFlow } from '@xyflow/react';
import './WorkflowNodes.css';

function MessageNode({ id, data }) {
  const { updateNodeData } = useReactFlow();

  return (
    <div className="node-card node-mensagem">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">💬 Mensagem</div>
      <textarea
        className="node-textarea"
        value={data.texto || ''}
        onChange={(e) => updateNodeData(id, { texto: e.target.value })}
        placeholder="Digite a mensagem..."
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default MessageNode;