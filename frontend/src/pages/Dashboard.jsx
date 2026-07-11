import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { obterEstatisticas } from "../services/dashboardService";
import ModalLeadsFiltro from "../components/ModalLeadsFiltro";
import "./Dashboard.css";

const CORES_PIZZA = [
  "#39ff88",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#a78bfa",
  "#f87171",
  "#22d3ee",
  "#f472b6",
];

function Dashboard() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modal, setModal] = useState(null);

  async function recarregarEstatisticas() {
    try {
      const resultado = await obterEstatisticas();
      setDados(resultado);
    } catch (err) {
      console.error(err);
    }
  }

  function irParaDisparoRapido(lead) {
    navigate("/disparo", { state: { leadsSelecionados: [lead.id] } });
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
  const totalGeral = dados.totalLeads || 1;
  const percentEnviado = Math.round(
    (dados.porStatus.Enviado / totalGeral) * 100,
  );
  const percentNovo = Math.round((dados.porStatus.Novo / totalGeral) * 100);
  const qtdNichos = dados.porSegmento.length;

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <div className="dashboard-container">
      <Link to="/painel" className="painel-link-voltar">
        ← Voltar ao Painel
      </Link>

      <motion.h1
        className="dashboard-titulo"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        LeadFlow
      </motion.h1>

      {/* Cards de totais */}
      <div className="dashboard-cards">
        {[
          {
            titulo: "Todos os leads",
            filtro: {},
            numero: dados.totalLeads,
            label: "Total de leads",
            contexto: `${qtdNichos} ${qtdNichos === 1 ? "nicho" : "nichos"} diferentes`,
          },
          {
            titulo: "Leads enviados",
            filtro: { status: "Enviado" },
            numero: dados.porStatus.Enviado,
            label: "Mensagens enviadas",
            contexto: `${percentEnviado}% do total`,
          },
          {
            titulo: "Leads aguardando contato",
            filtro: { status: "Novo" },
            numero: dados.porStatus.Novo,
            label: "Aguardando contato",
            contexto: `${percentNovo}% ainda sem ação`,
          },
        ].map((card, i) => (
          <motion.div
            key={card.titulo}
            className="dashboard-card dashboard-card-clicavel"
            onClick={() =>
              setModal({ titulo: card.titulo, filtro: card.filtro })
            }
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            whileHover={{ y: -4 }}
          >
            <span className="dashboard-card-numero">{card.numero}</span>
            <span className="dashboard-card-label">{card.label}</span>
            <span className="dashboard-card-contexto">{card.contexto}</span>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Funil de status */}
        <motion.div
          className="dashboard-bloco"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
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
        </motion.div>

        {/* Leads mais encontrados — barra horizontal */}
        <motion.div
          className="dashboard-bloco"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
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
        </motion.div>

        {/* Leads por estado — donut com legenda lateral */}
        <motion.div
          className="dashboard-bloco"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <h2>Leads por estado</h2>
          {dados.porEstado.length === 0 ? (
            <p className="dashboard-vazio-texto">Nenhum lead ainda.</p>
          ) : (
            <div className="dashboard-donut-wrapper">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={dados.porEstado}
                    dataKey="total"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    onClick={(entry) =>
                      setModal({
                        titulo: `Leads em ${entry.estado}`,
                        filtro: { estado: entry.estado },
                      })
                    }
                  >
                    {dados.porEstado.map((entry, index) => (
                      <Cell
                        key={entry.estado}
                        fill={CORES_PIZZA[index % CORES_PIZZA.length]}
                        cursor="pointer"
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#131a2b",
                      border: "1px solid rgba(57,255,136,0.35)",
                      borderRadius: 8,
                      color: "#e5e7eb",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="dashboard-donut-legenda">
                {dados.porEstado.map((item, index) => {
                  const percentual = Math.round(
                    (item.total / totalGeral) * 100,
                  );
                  return (
                    <div
                      key={item.estado}
                      className="dashboard-legenda-item dashboard-lista-clicavel"
                      onClick={() =>
                        setModal({
                          titulo: `Leads em ${item.estado}`,
                          filtro: { estado: item.estado },
                        })
                      }
                    >
                      <span
                        className="dashboard-legenda-bolinha"
                        style={{
                          background: CORES_PIZZA[index % CORES_PIZZA.length],
                        }}
                      />
                      <span className="dashboard-legenda-sigla">
                        {item.estado === "Não informado"
                          ? "-"
                          : item.estado}
                      </span>
                      <span className="dashboard-legenda-percentual">
                        {percentual}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top prioritários */}
      <motion.div
        className="dashboard-bloco dashboard-bloco-largo"
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
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
                      →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      <AnimatePresence>
        {modal && (
          <ModalLeadsFiltro
            titulo={modal.titulo}
            filtro={modal.filtro}
            onFechar={() => setModal(null)}
            onLeadExcluido={recarregarEstatisticas}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;
