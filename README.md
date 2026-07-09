# 🎯 LeadFlow

**Plataforma SaaS de prospecção que encontra empresas sem site no Google Maps e automatiza o primeiro contato via WhatsApp.**

Desenvolvido por [Adriano Rocha](https://github.com/adriano-rocha) como projeto full-stack de portfólio, unindo scraping, API REST, banco relacional, automação de mensagens e um dashboard de acompanhamento.

---

## 💡 A ideia por trás do produto

Empresas pequenas e locais (advogados, salões, academias, oficinas) frequentemente não têm site próprio — geralmente usam só Instagram ou WhatsApp. Isso representa uma oportunidade real de prospecção para quem vende sites e serviços digitais.

O LeadFlow automatiza esse processo:
1. **Busca** negócios por nicho e cidade no Google Maps
2. **Filtra** automaticamente só quem não tem site próprio (nem link para redes sociais)
3. **Ranqueia** os resultados por nota — leads com nota mais baixa aparecem primeiro, priorizando quem mais provavelmente precisa de ajuda com presença digital
4. **Organiza** tudo em um painel e dashboard visual
5. **Automatiza** o disparo da primeira mensagem via WhatsApp, usando um construtor de fluxo visual (drag-and-drop)

---

## 🏗️ Arquitetura

O projeto é dividido em 4 serviços independentes que se comunicam entre si:

```
┌─────────────────┐        ┌──────────────────┐
│  Scraper         │──HTTP─▶│  Backend           │
│  Python +        │        │  Node/Express +    │
│  Playwright       │        │  Prisma/PostgreSQL │
└─────────────────┘        └─────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                                      ▼
          ┌──────────────────┐              ┌───────────────────────┐
          │  Frontend          │              │  Evolution API          │
          │  React + Vite      │              │  (WhatsApp, self-hosted │
          │                    │              │   via Docker)           │
          └──────────────────┘              └───────────────────────┘
```

- O **scraper** roda como um microsserviço Python separado, consumido pelo backend via requisição HTTP — arquitetura poliglota intencional, permitindo usar a ferramenta certa (Playwright) para automação de navegador sem acoplar isso ao backend Node.
- O **backend** centraliza autenticação, regras de negócio e persistência.
- O **frontend** consome a API REST e não tem nenhuma lógica de scraping ou WhatsApp diretamente.
- A **Evolution API** roda em containers Docker isolados, com Postgres próprio, desacoplada do banco principal da aplicação.

---

## ⚙️ Stack técnica

| Camada | Tecnologias |
|---|---|
| **Backend** | Node.js, Express, Prisma ORM, PostgreSQL, JWT, bcrypt |
| **Frontend** | React, Vite, React Router, React Flow (construtor de workflow) |
| **Scraper** | Python, Playwright (automação de navegador assíncrona) |
| **WhatsApp** | Evolution API (self-hosted via Docker) |
| **Deploy** | Render (backend), Vercel (frontend), ngrok (túnel local do scraper/Evolution durante desenvolvimento) |

---

## ✨ Funcionalidades

- 🔍 Busca de leads por segmento + cidade, com filtro automático de "sem site próprio"
- ⭐ Ranking por nota de avaliação do Google Maps (menor nota primeiro = maior prioridade)
- 📊 Dashboard com métricas clicáveis (cada card/segmento abre um modal com os leads filtrados)
- 🗑️ Exclusão de leads direto pelos modais, sem sair do dashboard
- 🧩 Construtor visual de workflow de mensagens (drag-and-drop com React Flow: início → mensagem → delay → imagem)
- 📱 Central de instâncias WhatsApp (múltiplos números, conexão via QR Code)
- 📄 Exportação de leads selecionados para CSV
- 🔐 Autenticação JWT, dados isolados por usuário

---

## 🧠 Decisões técnicas e aprendizados

Esta seção documenta escolhas reais feitas durante o desenvolvimento — incluindo caminhos que não deram certo e por quê.

**Extração de dados resiliente a mudanças do Google Maps**
A extração da nota de avaliação passou por várias iterações: inicialmente via classes CSS específicas (`F7nice`), depois via `aria-label`, até chegar na abordagem final — ler o texto visível renderizado do card (`inner_text()`) e extrair os números via regex, sem depender de nenhuma palavra-chave ou classe específica. Essa abordagem se mostrou a mais estável, já que o Google muda a estrutura HTML com frequência e usa `aria-label`s inconsistentes entre idiomas.

**Corte de escopo consciente**
A ideia inicial incluía também capturar a *quantidade* de avaliações para refinar o ranking. Depois de testar quatro estratégias diferentes de extração sem sucesso consistente, a decisão foi remover esse campo — priorizando um ranking simples e confiável (só por nota) em vez de uma feature instável. Métrica de sucesso > complexidade acumulada.

**Segurança de credenciais**
Durante o desenvolvimento, uma chave de API da Evolution API foi identificada hardcoded no `docker-compose.yml`. Foi corrigida movendo o valor para variáveis de ambiente (`.env`, git-ignorado), com regeneração da chave e propagação da correção para todos os serviços que a consomem.

**Arquitetura de componentes reutilizável**
O modal de leads filtrados (usado no dashboard para nicho, status e totais) foi implementado como um único componente genérico, parametrizado por filtro (`{ segmento }`, `{ status }`, ou vazio para "todos") — evitando duplicar a lógica de busca, exibição e exclusão em três componentes separados.

---

## 🚀 Como rodar localmente

Pré-requisitos: Node.js, Python 3.10+, Docker, PostgreSQL.

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Scraper
cd scraper
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Evolution API (WhatsApp)
cd evolution-api
docker compose up -d
```

Cada pasta tem um `.env.example` com as variáveis necessárias.

---

## 📌 Próximos passos

- [ ] Paginação na listagem de leads (atualmente carrega tudo de uma vez)
- [ ] Testes automatizados (backend)
- [ ] Deduplicação mais inteligente de leads entre buscas sobrepostas

---

## 👤 Autor

**Adriano Rocha**
Desenvolvedor full-stack autodidata, em transição para uma vaga júnior/estágio com foco em automação (Python + ERP).