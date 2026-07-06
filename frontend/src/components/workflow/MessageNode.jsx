import { Handle, Position, useReactFlow } from "@xyflow/react";
import "./WorkflowNodes.css";

function MessageNode({ id, data }) {
  const { updateNodeData, setNodes, setEdges } = useReactFlow();

  function excluirNo() {
    setNodes((nos) => nos.filter((no) => no.id !== id));
    setEdges((arestas) =>
      arestas.filter((aresta) => aresta.source !== id && aresta.target !== id),
    );
  }

  return (
    <div className="node-card node-mensagem">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">
        <span>💬 Mensagem</span>
        <button className="node-excluir" onClick={excluirNo}>
          ✕
        </button>
      </div>
      <textarea
        className="node-textarea"
        value={data.texto || ""}
        onChange={(e) => updateNodeData(id, { texto: e.target.value })}
        placeholder="Digite a mensagem..."
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default MessageNode;
