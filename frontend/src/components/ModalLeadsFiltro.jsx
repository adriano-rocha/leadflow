import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarLeads, excluirLeads } from '../services/leadService';
import './ModalLeadsFiltro.css';

function ModalLeadsFiltro({ titulo, filtro, onFechar, onLeadExcluido }) {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await listarLeads(filtro);
        setLeads(dados.leads);
      } catch (err) {
        console.error(err);
        setErro('Erro ao carregar leads');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [filtro]);

  function alternarSelecao(id) {
    setSelecionados((atuais) =>
      atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id]
    );
  }

  function selecionarTodos() {
    if (selecionados.length === leads.length) {
      setSelecionados([]);
    } else {
      setSelecionados(leads.map((lead) => lead.id));
    }
  }

  function irParaDisparo() {
    navigate('/disparo', { state: { leadsSelecionados: selecionados } });
  }

  async function handleExcluirLinha(lead) {
    const confirmar = window.confirm(`Excluir "${lead.nome}"?`);
    if (!confirmar) return;

    try {
      await excluirLeads([lead.id]);
      setLeads((atuais) => atuais.filter((l) => l.id !== lead.id));
      setSelecionados((atuais) => atuais.filter((id) => id !== lead.id));
      if (onLeadExcluido) onLeadExcluido();
    } catch (err) {
      console.error(err);
      setErro('Erro ao excluir lead');
    }
  }

  async function handleExcluirSelecionados() {
    const confirmar = window.confirm(`Excluir ${selecionados.length} lead(s) selecionado(s)?`);
    if (!confirmar) return;

    try {
      await excluirLeads(selecionados);
      setLeads((atuais) => atuais.filter((lead) => !selecionados.includes(lead.id)));
      setSelecionados([]);
      if (onLeadExcluido) onLeadExcluido();
    } catch (err) {
      console.error(err);
      setErro('Erro ao excluir leads');
    }
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>

        {selecionados.length > 0 && (
          <div className="modal-acoes-selecao">
            <span>{selecionados.length} lead(s) selecionado(s)</span>
            <button onClick={irParaDisparo} className="modal-botao-acao">
              Enviar para Workflow →
            </button>
            <button onClick={handleExcluirSelecionados} className="modal-botao-excluir-lote">
              🗑️ Excluir selecionados
            </button>
          </div>
        )}

        {carregando && <p className="dashboard-vazio-texto">Carregando...</p>}
        {erro && <p className="dashboard-erro">{erro}</p>}

        {!carregando && !erro && (
          leads.length === 0 ? (
            <p className="dashboard-vazio-texto">Nenhum lead encontrado.</p>
          ) : (
            <table className="tabela-leads">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={leads.length > 0 && selecionados.length === leads.length}
                      onChange={selecionarTodos}
                    />
                  </th>
                  <th>Nome</th>
                  <th>Nicho</th>
                  <th>Cidade</th>
                  <th>Telefone</th>
                  <th>Nota</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selecionados.includes(lead.id)}
                        onChange={() => alternarSelecao(lead.id)}
                      />
                    </td>
                    <td>{lead.nome}</td>
                    <td>{lead.segmento}</td>
                    <td>{lead.cidade}</td>
                    <td>{lead.telefone}</td>
                    <td className="celula-nota">⭐ {lead.avaliacao}</td>
                    <td>{lead.status}</td>
                    <td>
                      <button
                        className="modal-excluir-linha"
                        onClick={() => handleExcluirLinha(lead)}
                        title="Excluir lead"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}

export default ModalLeadsFiltro;