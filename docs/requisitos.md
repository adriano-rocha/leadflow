# LEADFLOW

## 1. Objetivo
Descrever em 2-3 linhas o que o sistema faz.

## 2. Funcionalidades
- Scraper de leads (Google Maps)
- Painel com login
- Busca de leads (segmento, cidade, limite)
- Exportação CSV/PDF
- Central de instâncias WhatsApp (Evolution API)
- Workflow de automação de mensagens (estilo n8n)

## 3. Fluxo de uso (passo a passo do usuário)
1. Usuário faz login
2. Busca leads por segmento + cidade
3. Sistema retorna lista sem duplicados
4. Usuário exporta ou seleciona leads
5. Usuário cria/conecta instância WhatsApp
6. Usuário monta workflow de mensagens
7. Vincula leads ao workflow
8. Dispara automação

## 4. Tecnologias
- Backend: Node.js + Express + Prisma
- Banco: PostgreSQL (Supabase)
- Scraper: Python + Playwright + FastAPI
- Frontend: React + Vite
- Automação: React Flow + Evolution API (Docker)
- Deploy: Render (backend/scraper) + Vercel (frontend)

## 5. Regras de negócio
- Não permitir leads duplicados (nome + telefone)
- Status do lead: Novo / Enviado / Erro
- Delay entre mensagens configurável no workflow
- Delay entre leads no disparo: 5 segundos