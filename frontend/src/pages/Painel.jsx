import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { buscarLeads } from '../services/leadService';
import './Painel.css';

function Painel() {
  const { usuario, logout } = useAuth();

  const [segmento, setSegmento] = useState('');
  const [cidade, setCidade] = useState('');
  const [limite, setLimite] = useState(10);
  const [leads, setLeads] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleBuscar(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resultado = await buscarLeads(segmento, cidade, Number(limite));
      setLeads((leadsAtuais) => [...resultado.leads, ...leadsAtuais]);
    } catch (err) {
      console.error(err);
      setErro('Erro ao buscar leads. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  function badgeStatus(status) {
    const classes = {
      Novo: 'badge-novo',
      Enviado: 'badge-enviado',
      Erro: 'badge-erro',
    };
    return `badge ${classes[status] || 'badge-novo'}`;
  }

  return (
    <div className="painel-container">
      <div className="painel-header">
        <h1 className="painel-titulo">Painel LeadFlow</h1>
        <div className="painel-usuario">
          <span>Olá, {usuario?.nome}</span>
          <Link to="/instancias" className="painel-link">Central de Instâncias</Link>
          <button onClick={logout} className="painel-botao-sair">Sair</button>
        </div>
      </div>

      <form onSubmit={handleBuscar} className="painel-form">
        <input
          type="text"
          placeholder="Segmento (ex: dentista)"
          value={segmento}
          onChange={(e) => setSegmento(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          required
        />
        <select value={limite} onChange={(e) => setLimite(e.target.value)}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <button type="submit" className="painel-botao-buscar" disabled={carregando}>
          {carregando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {erro && <p className="painel-erro">{erro}</p>}

      {leads.length === 0 && !carregando ? (
        <div className="painel-vazio">Nenhum lead buscado ainda.</div>
      ) : (
        <table className="tabela-leads">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Endereço</th>
              <th>Telefone</th>
              <th>Site próprio?</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.nome}</td>
                <td>{lead.endereco}</td>
                <td>{lead.telefone}</td>
                <td className={lead.temSiteProprio ? 'badge-sim' : 'badge-nao'}>
                  {lead.temSiteProprio ? 'Sim' : 'Não'}
                </td>
                <td><span className={badgeStatus(lead.status)}>{lead.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Painel;