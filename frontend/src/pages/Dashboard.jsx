import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obterEstatisticas } from "../services/dashboardService";
import ModalLeadsFiltro from "../components/ModalLeadsFiltro";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modal, setModal] = useState(null); // { titulo, filtro } | null

  async function recarregarEstatisticas() {
    try {
      const resultado = await obterEstatisticas();
      setDados(resultado);
    } catch (err) {
      console.error(err);
    }
  }

  function irParaDisparoRapido(lead) {
    navigate('/disparo', { state: { leadsSelecionados: [lead.id] } });
  }

  useEffect(() => {
    (async () => {
      try {
        const resultado = await obterEstatisticas();
        setDados(resultado);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar estatísticas");
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  if (carregando) {
    return (
      <div className="dashboard-container">
        <p>Carregando...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="dashboard-container">
        <p className="dashboard-erro">{erro}</p>
      </div>
    );
  }

  const maiorSegmento = dados.porSegmento[0]?.total || 1;
  const maiorCidade = dados.porCidade[0]?.total || 1;
  const totalGeral = dados.totalLeads || 1;
  const percentEnviado = Math.round(
    (dados.porStatus.Enviado / totalGeral) * 100,
  );
  const percentNovo = Math.round((dados.porStatus.Novo / totalGeral) * 100);
  const qtdNichos = dados.porSegmento.length;

  return (
    <div className="dashboard-container">
      <Link to="/painel" className="painel-link-voltar">
        ← Voltar ao Painel
      </Link>
      <h1 className="dashboard-titulo">LeadFlow</h1>

      {/* Cards de totais */}
      <div className="dashboard-cards">
        <div
          className="dashboard-card dashboard-card-clicavel"
          onClick={() => setModal({ titulo: "Todos os leads", filtro: {} })}
        >
          <span className="dashboard-card-numero">{dados.totalLeads}</span>
          <span className="dashboard-card-label">Total de leads</span>
          <span className="dashboard-card-contexto">
            {qtdNichos} {qtdNichos === 1 ? "nicho" : "nichos"} diferentes
          </span>
        </div>
        <div
          className="dashboard-card dashboard-card-clicavel"
          onClick={() =>
            setModal({
              titulo: "Leads enviados",
              filtro: { status: "Enviado" },
            })
          }
        >
          <span className="dashboard-card-numero">
            {dados.porStatus.Enviado}
          </span>
          <span className="dashboard-card-label">Mensagens enviadas</span>
          <span className="dashboard-card-contexto">
            {percentEnviado}% do total
          </span>
        </div>
        <div
          className="dashboard-card dashboard-card-clicavel"
          onClick={() =>
            setModal({
              titulo: "Leads aguardando contato",
              filtro: { status: "Novo" },
            })
          }
        >
          <span className="dashboard-card-numero">{dados.porStatus.Novo}</span>
          <span className="dashboard-card-label">Aguardando contato</span>
          <span className="dashboard-card-contexto">
            {percentNovo}% ainda sem ação
          </span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Funil de status */}
        <div className="dashboard-bloco">
          <h2>Funil de status</h2>
          <div className="dashboard-funil">
            <div
              className="dashboard-funil-item dashboard-lista-clicavel"
              onClick={() =>
                setModal({ titulo: "Leads novos", filtro: { status: "Novo" } })
              }
            >
              <span className="badge badge-novo">Novo</span>
              <span>{dados.porStatus.Novo}</span>
            </div>
            <div
              className="dashboard-funil-item dashboard-lista-clicavel"
              onClick={() =>
                setModal({
                  titulo: "Leads enviados",
                  filtro: { status: "Enviado" },
                })
              }
            >
              <span className="badge badge-enviado">Enviado</span>
              <span>{dados.porStatus.Enviado}</span>
            </div>
            <div
              className="dashboard-funil-item dashboard-lista-clicavel"
              onClick={() =>
                setModal({
                  titulo: "Leads com erro",
                  filtro: { status: "Erro" },
                })
              }
            >
              <span className="badge badge-erro">Erro</span>
              <span>{dados.porStatus.Erro}</span>
            </div>
          </div>
        </div>

        {/* Leads mais encontrados — barra horizontal */}
        <div className="dashboard-bloco">
          <h2>Leads mais encontrados</h2>
          {dados.porSegmento.length === 0 ? (
            <p className="dashboard-vazio-texto">Nenhum lead ainda.</p>
          ) : (
            <div className="dashboard-barras">
              {dados.porSegmento.map((item, index) => {
                const percentual = Math.round((item.total / totalGeral) * 100);
                return (
                  <div
                    key={item.segmento}
                    className="dashboard-barra-item dashboard-lista-clicavel"
                    onClick={() =>
                      setModal({
                        titulo: item.segmento,
                        filtro: { segmento: item.segmento },
                      })
                    }
                  >
                    <span className="dashboard-barra-label">
                      {item.segmento}
                    </span>
                    <div className="dashboard-barra-trilho">
                      <div
                        className="dashboard-barra-preenchida"
                        style={{
                          width: `${(item.total / maiorSegmento) * 100}%`,
                          animationDelay: `${index * 80}ms`,
                        }}
                      />
                    </div>
                    <span className="dashboard-barra-valor">
                      {item.total}{" "}
                      <span className="dashboard-barra-percentual">
                        ({percentual}%)
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top cidades — barra horizontal, mesmo padrão do bloco de segmentos */}
        <div className="dashboard-bloco">
          <h2>Top cidades</h2>
          {dados.porCidade.length === 0 ? (
            <p className="dashboard-vazio-texto">Nenhum lead ainda.</p>
          ) : (
            <div className="dashboard-barras">
              {dados.porCidade.map((item, index) => {
                const percentual = Math.round((item.total / totalGeral) * 100);
                return (
                  <div
                    key={item.cidade}
                    className="dashboard-barra-item dashboard-lista-clicavel"
                    onClick={() =>
                      setModal({
                        titulo: item.cidade,
                        filtro: { cidade: item.cidade },
                      })
                    }
                  >
                    <span className="dashboard-barra-label">
                      {item.cidade}
                    </span>
                    <div className="dashboard-barra-trilho">
                      <div
                        className="dashboard-barra-preenchida"
                        style={{
                          width: `${(item.total / maiorCidade) * 100}%`,
                          animationDelay: `${index * 80}ms`,
                        }}
                      />
                    </div>
                    <span className="dashboard-barra-valor">
                      {item.total}{" "}
                      <span className="dashboard-barra-percentual">
                        ({percentual}%)
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top prioritários */}
      <div className="dashboard-bloco dashboard-bloco-largo">
        <h2>🎯 Top 10 leads mais prioritários</h2>
        {dados.topPrioritarios.length === 0 ? (
          <p className="dashboard-vazio-texto">
            Nenhum lead com avaliação registrada ainda.
          </p>
        ) : (
          <table className="tabela-leads">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Nicho</th>
                <th>Cidade</th>
                <th>Avaliação</th>
                <th>Telefone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dados.topPrioritarios.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.nome}</td>
                  <td>{lead.segmento}</td>
                  <td>{lead.cidade}</td>
                  <td className="celula-nota">⭐ {lead.avaliacao}</td>
                  <td>{lead.telefone}</td>
                  <td>
                    <button
                      className="dashboard-botao-disparo"
                      onClick={() => irParaDisparoRapido(lead)}
                      title="Enviar para Workflow"
                    >
                      📤
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ModalLeadsFiltro
          titulo={modal.titulo}
          filtro={modal.filtro}
          onFechar={() => setModal(null)}
          onLeadExcluido={recarregarEstatisticas}
        />
      )}
    </div>
  );
}

export default Dashboard;