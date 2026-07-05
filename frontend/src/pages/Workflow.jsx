import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import StartNode from '../components/workflow/StartNode';
import MessageNode from '../components/workflow/MessageNode';
import DelayNode from '../components/workflow/DelayNode';
import ImageNode from '../components/workflow/ImageNode';
import './Workflow.css';

const nodeTypes = {
  inicio: StartNode,
  mensagem: MessageNode,
  delay: DelayNode,
  imagem: ImageNode,
};

const nosIniciais = [
  { id: '1', type: 'inicio', position: { x: 50, y: 250 }, data: {} },
];

let proximoId = 2;

function Workflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(nosIniciais);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((edgesAtuais) => addEdge(params, edgesAtuais)),
    [setEdges]
  );

  function adicionarNo(tipo) {
    const novoNo = {
      id: String(proximoId++),
      type: tipo,
      position: { x: 300 + Math.random() * 300, y: 100 + Math.random() * 300 },
      data: {},
    };
    setNodes((nosAtuais) => [...nosAtuais, novoNo]);
  }

  return (
    <div className="workflow-container">
      <div className="workflow-toolbar">
        <button onClick={() => adicionarNo('mensagem')}>+ Mensagem</button>
        <button onClick={() => adicionarNo('delay')}>+ Delay</button>
        <button onClick={() => adicionarNo('imagem')}>+ Imagem</button>
      </div>
      <div className="workflow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default Workflow;