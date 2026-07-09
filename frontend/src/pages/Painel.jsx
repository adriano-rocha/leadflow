import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  buscarLeads,
  listarLeads,
  excluirLeads,
} from "../services/leadService";
import exportarCsv from "../utils/exportarCsv";
import "./Painel.css";

function Painel() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [segmento, setSegmento] = useState("");
  const [cidade, setCidade] = useState("");
  const [limite, setLimite] = useState(10);
  const [leads, setLeads] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarLeadsSalvos() {
      try {
        const dados = await listarLeads();
        setLeads(dados.leads);
      } catch (err) {
        console.error(err);
      }
    }
    carregarLeadsSalvos();
  }, []);

  async function handleBuscar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resultado = await buscarLeads(segmento, cidade, Number(limite));
      setLeads((leadsAtuais) => [...resultado.leads, ...leadsAtuais]);
    } catch (err) {
      console.error(err);
      setErro("Erro ao buscar leads. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  function alternarSelecao(id) {
    setSelecionados((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id],
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
    navigate("/disparo", { state: { leadsSelecionados: selecionados } });
  }

  async function handleExcluir() {
    const confirmar = window.confirm(
      `Excluir ${selecionados.length} lead(s) selecionado(s)?`,
    );
    if (!confirmar) return;

    try {
      await excluirLeads(selecionados);
      setLeads((atuais) =>
        atuais.filter((lead) => !selecionados.includes(lead.id)),
      );
      setSelecionados([]);
    } catch (err) {
      console.error(err);
      setErro("Erro ao excluir leads");
    }
  }

  function handleExportarCsv() {
    if (selecionados.length === 0) {
      setErro("Selecione ao menos um lead para exportar");
      return;
    }

    const leadsParaExportar = leads.filter((lead) =>
      selecionados.includes(lead.id),
    );
    exportarCsv(leadsParaExportar);
  }

  function badgeStatus(status) {
    const classes = {
      Novo: "badge-novo",
      Enviado: "badge-enviado",
      Erro: "badge-erro",
    };
    return `badge ${classes[status] || "badge-novo"}`;
  }

  return (
    <div className="painel-container">
      <div className="painel-header">
        <h1 className="painel-titulo">Painel LeadFlow</h1>
        <div className="painel-usuario">
          <span>Olá, {usuario?.nome}</span>
          <Link to="/" className="painel-link">
            Dashboard
          </Link>
          <Link to="/instancias" className="painel-link">
            Central de Instâncias
          </Link>
          <Link to="/workflow" className="painel-link">
            Workflow
          </Link>
          <button onClick={logout} className="painel-botao-sair">
            Sair
          </button>
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
        <button
          type="submit"
          className="painel-botao-buscar"
          disabled={carregando}
        >
          {carregando ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {erro && <p className="painel-erro">{erro}</p>}

      {selecionados.length > 0 && (
        <div className="painel-acoes-selecao">
          <span>{selecionados.length} lead(s) selecionado(s)</span>
          <button onClick={irParaDisparo} className="painel-botao-buscar">
            Enviar para Workflow →
          </button>
          <button onClick={handleExportarCsv} className="painel-botao-buscar">
            📄 Exportar CSV
          </button>
          <button onClick={handleExcluir} className="painel-botao-excluir">
            🗑️ Excluir
          </button>
        </div>
      )}

      {leads.length === 0 && !carregando ? (
        <div className="painel-vazio">Nenhum lead buscado ainda.</div>
      ) : (
        <table className="tabela-leads">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    leads.length > 0 && selecionados.length === leads.length
                  }
                  onChange={selecionarTodos}
                />
              </th>
              <th>Nome</th>
              <th>Endereço</th>
              <th>Telefone</th>
              <th>Site próprio?</th>
              <th>Nota</th>
              <th>Status</th>
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
                <td>{lead.endereco}</td>
                <td>{lead.telefone}</td>
                <td className={lead.temSiteProprio ? "badge-sim" : "badge-nao"}>
                  {lead.temSiteProprio ? "Sim" : "Não"}
                </td>
                <td className="celula-nota">⭐ {lead.avaliacao}</td>

                <td>
                  <span className={badgeStatus(lead.status)}>
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Painel;
