import { useState, useEffect } from 'react';
import { listarLeads, excluirLeads } from '../services/leadService';
import './ModalLeadsFiltro.css';

function ModalLeadsFiltro({ titulo, filtro, onFechar, onLeadExcluido }) {
  const [leads, setLeads] = useState([]);
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

  async function handleExcluir(lead) {
    const confirmar = window.confirm(`Excluir "${lead.nome}"?`);
    if (!confirmar) return;

    try {
      await excluirLeads([lead.id]);
      setLeads((atuais) => atuais.filter((l) => l.id !== lead.id));
      if (onLeadExcluido) onLeadExcluido();
    } catch (err) {
      console.error(err);
      setErro('Erro ao excluir lead');
    }
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>

        {carregando && <p className="dashboard-vazio-texto">Carregando...</p>}
        {erro && <p className="dashboard-erro">{erro}</p>}

        {!carregando && !erro && (
          leads.length === 0 ? (
            <p className="dashboard-vazio-texto">Nenhum lead encontrado.</p>
          ) : (
            <table className="tabela-leads">
              <thead>
                <tr>
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
                    <td>{lead.nome}</td>
                    <td>{lead.segmento}</td>
                    <td>{lead.cidade}</td>
                    <td>{lead.telefone}</td>
                    <td className="celula-nota">⭐ {lead.avaliacao}</td>
                    <td>{lead.status}</td>
                    <td>
                      <button
                        className="modal-excluir-linha"
                        onClick={() => handleExcluir(lead)}
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