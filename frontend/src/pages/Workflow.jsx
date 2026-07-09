import { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import StartNode from "../components/workflow/StartNode";
import MessageNode from "../components/workflow/MessageNode";
import DelayNode from "../components/workflow/DelayNode";
import ImageNode from "../components/workflow/ImageNode";
import {
  salvarWorkflow,
  listarWorkflows,
  buscarWorkflowPorId,
  excluirWorkflow,
} from "../services/workflowService";
import "./Workflow.css";

const nodeTypes = {
  inicio: StartNode,
  mensagem: MessageNode,
  delay: DelayNode,
  imagem: ImageNode,
};

const nosIniciais = [
  { id: "1", type: "inicio", position: { x: 50, y: 250 }, data: {} },
];

let proximoId = 2;

function Workflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(nosIniciais);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nomeWorkflow, setNomeWorkflow] = useState("");
  const [workflowsSalvos, setWorkflowsSalvos] = useState([]);
  const [mensagemStatus, setMensagemStatus] = useState("");

  const onConnect = useCallback(
    (params) => setEdges((edgesAtuais) => addEdge(params, edgesAtuais)),
    [setEdges],
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

  async function handleSalvar() {
    if (!nomeWorkflow) {
      setMensagemStatus("Digite um nome pro workflow antes de salvar");
      return;
    }

    try {
      const estruturaJson = { nodes, edges };
      await salvarWorkflow(nomeWorkflow, estruturaJson);
      setMensagemStatus("Workflow salvo com sucesso!");
      carregarListaWorkflows();
    } catch (err) {
      console.error(err);
      setMensagemStatus("Erro ao salvar workflow");
    }
  }

  async function carregarListaWorkflows() {
    try {
      const dados = await listarWorkflows();
      setWorkflowsSalvos(dados.workflows);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCarregar(id) {
    if (!id) return;

    try {
      const dados = await buscarWorkflowPorId(id);
      const { nodes: nosCarregados, edges: arestasCarregadas } =
        dados.workflow.estruturaJson;
      setNodes(nosCarregados);
      setEdges(arestasCarregadas);
      setNomeWorkflow(dados.workflow.nome);
      setMensagemStatus("Workflow carregado!");
    } catch (err) {
      console.error(err);
      setMensagemStatus("Erro ao carregar workflow");
    }
  }

  async function handleExcluirWorkflow(id, e) {
    e.stopPropagation();
    const confirmar = window.confirm("Excluir este workflow?");
    if (!confirmar) return;

    try {
      await excluirWorkflow(id);
      carregarListaWorkflows();
      setMensagemStatus("Workflow excluído!");
    } catch (err) {
      console.error(err);
      setMensagemStatus("Erro ao excluir workflow");
    }
  }

  useEffect(() => {
    carregarListaWorkflows();
  }, []);

  return (
    <div className="workflow-container">
      <div className="workflow-toolbar">
        <button onClick={() => adicionarNo("mensagem")}>+ Mensagem</button>
        <button onClick={() => adicionarNo("delay")}>+ Delay</button>
        <button onClick={() => adicionarNo("imagem")}>+ Imagem</button>

        <input
          type="text"
          placeholder="Nome do workflow"
          value={nomeWorkflow}
          onChange={(e) => setNomeWorkflow(e.target.value)}
          style={{ marginLeft: 20 }}
        />
        <button onClick={handleSalvar}>💾 Salvar</button>

        <div className="workflow-lista-salvos">
          {workflowsSalvos.map((wf) => (
            <div
              key={wf.id}
              className="workflow-item-salvo"
              onClick={() => handleCarregar(wf.id)}
            >
              <span>{wf.nome}</span>
              <button onClick={(e) => handleExcluirWorkflow(wf.id, e)}>
                ✕
              </button>
            </div>
          ))}
        </div>

        {mensagemStatus && (
          <span style={{ marginLeft: 10 }}>{mensagemStatus}</span>
        )}
      </div>
      <div className="workflow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          deleteKeyCode={["Backspace", "Delete"]}
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
