import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { buscarLeads } from '../services/leadService';
import { Link } from 'react-router-dom';

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

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Painel LeadFlow</h1>
        <div>
          <span>Olá, {usuario?.nome}</span>{' '}
          <Link to="/instancias">Central de Instâncias</Link>
          <button onClick={logout}>Sair</button>
        </div>
      </div>

      <form onSubmit={handleBuscar} style={{ marginTop: 20, display: 'flex', gap: 10 }}>
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
        <button type="submit" disabled={carregando}>
          {carregando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <table style={{ marginTop: 20, width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={estiloTh}>Nome</th>
            <th style={estiloTh}>Endereço</th>
            <th style={estiloTh}>Telefone</th>
            <th style={estiloTh}>Site próprio?</th>
            <th style={estiloTh}>Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td style={estiloTd}>{lead.nome}</td>
              <td style={estiloTd}>{lead.endereco}</td>
              <td style={estiloTd}>{lead.telefone}</td>
              <td style={estiloTd}>{lead.temSiteProprio ? 'Sim' : 'Não'}</td>
              <td style={estiloTd}>{lead.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {leads.length === 0 && !carregando && <p>Nenhum lead buscado ainda.</p>}
    </div>
  );
}

const estiloTh = { border: '1px solid #ccc', padding: 8, textAlign: 'left' };
const estiloTd = { border: '1px solid #ccc', padding: 8 };

export default Painel;