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
  const [instanciaEscolhida, setInstanciaEscolhida] = useState('');

  useEffect(() => {
    async function carregarDados() {
      const dadosWorkflows = await listarWorkflows();
      setWorkflows(dadosWorkflows.workflows);

      const respostaInstancias = await api.get('/instancias');
      setInstancias(respostaInstancias.data.instancias);
    }
    carregarDados();
  }, []);

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

      <button
        className="disparo-botao"
        disabled={!workflowEscolhido || !instanciaEscolhida || leadsSelecionados.length === 0}
      >
        🚀 Disparar
      </button>
    </div>
  );
}

export default Disparo;