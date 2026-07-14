import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { listarWorkflows } from '../services/workflowService';
import api from '../services/api';
import './Disparo.css';

function Disparo() {
  const location = useLocation();
  const leadsSelecionados = location.state?.leadsSelecionados || [];

  const [workflows, setWorkflows] = useState([]);
  const [instancias, setInstancias] = useState([]);
  const [workflowEscolhido, setWorkflowEscolhido] = useState('');
  const [proximoWorkflowEscolhido, setProximoWorkflowEscolhido] = useState('');
  const [instanciaEscolhida, setInstanciaEscolhida] = useState('');
  const [disparando, setDisparando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    async function carregarDados() {
      const dadosWorkflows = await listarWorkflows();
      setWorkflows(dadosWorkflows.workflows);

      const respostaInstancias = await api.get('/instancias');
      setInstancias(respostaInstancias.data.instancias);
    }
    carregarDados();
  }, []);

  async function handleDisparar() {
    setDisparando(true);
    setMensagem('');

    try {
      const resposta = await api.post('/disparo', {
        leadIds: leadsSelecionados,
        workflowId: workflowEscolhido,
        instanciaId: instanciaEscolhida,
        proximoWorkflowId: proximoWorkflowEscolhido || undefined,
      });
      setMensagem(`Disparo iniciado! Processando ${resposta.data.total} lead(s)...`);
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao iniciar disparo.');
    } finally {
      setDisparando(false);
    }
  }

  return (
    <div className="disparo-container">
      <Link to="/" className="painel-link-voltar">← Voltar ao Painel</Link>
      <h1 className="disparo-titulo">Disparar Automação</h1>

      <p className="disparo-info">
        {leadsSelecionados.length} lead(s) selecionado(s) para essa automação
      </p>

      <div className="disparo-campo">
        <label>Workflow</label>
        <select value={workflowEscolhido} onChange={(e) => setWorkflowEscolhido(e.target.value)}>
          <option value="">Selecione um workflow...</option>
          {workflows.map((wf) => (
            <option key={wf.id} value={wf.id}>{wf.nome}</option>
          ))}
        </select>
      </div>

      <div className="disparo-campo">
        <label>Workflow de continuação (opcional — só envia após o lead responder)</label>
        <select value={proximoWorkflowEscolhido} onChange={(e) => setProximoWorkflowEscolhido(e.target.value)}>
          <option value="">Nenhum (disparo único)</option>
          {workflows.map((wf) => (
            <option key={wf.id} value={wf.id}>{wf.nome}</option>
          ))}
        </select>
      </div>

      <div className="disparo-campo">
        <label>Instância do WhatsApp</label>
        <select value={instanciaEscolhida} onChange={(e) => setInstanciaEscolhida(e.target.value)}>
          <option value="">Selecione uma instância...</option>
          {instancias.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.nomeInstancia} ({inst.status})
            </option>
          ))}
        </select>
      </div>

      {mensagem && <p className="disparo-info">{mensagem}</p>}

      <button
        className="disparo-botao"
        onClick={handleDisparar}
        disabled={!workflowEscolhido || !instanciaEscolhida || leadsSelecionados.length === 0 || disparando}
      >
        {disparando ? 'Disparando...' : '🚀 Disparar'}
      </button>
    </div>
  );
}

export default Disparo;