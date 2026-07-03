# Modelagem do Banco de Dados — LeadFlow

## 1. usuarios
| Coluna | Tipo | Descrição |
|---|---|---|
| id | int (auto) | identificador único |
| nome | texto | nome do usuário |
| email | texto (único) | login |
| senha_hash | texto | senha criptografada |
| criado_em | data/hora | data de cadastro |

## 2. leads
| Coluna | Tipo | Descrição |
|---|---|---|
| id | int (auto) | identificador único |
| nome | texto | nome do estabelecimento |
| telefone | texto | número capturado |
| endereco | texto | endereço capturado |
| segmento | texto | nicho buscado (ex: "dentista") |
| cidade | texto | cidade buscada |
| status | texto | Novo / Enviado / Erro |
| usuario_id | int | FK → usuarios |
| criado_em | data/hora | quando foi capturado |

## 3. whatsapp_instances
| Coluna | Tipo | Descrição |
|---|---|---|
| id | int (auto) | identificador único |
| nome_instancia | texto | nome dado na Evolution API |
| status | texto | conectado / desconectado / aguardando_qrcode |
| usuario_id | int | FK → usuarios |
| criado_em | data/hora | quando foi criada |

## 4. workflows
| Coluna | Tipo | Descrição |
|---|---|---|
| id | int (auto) | identificador único |
| nome | texto | nome dado ao fluxo |
| estrutura_json | json | nós e conexões do React Flow |
| usuario_id | int | FK → usuarios |
| criado_em | data/hora | quando foi criado |

## 5. workflow_executions
| Coluna | Tipo | Descrição |
|---|---|---|
| id | int (auto) | identificador único |
| workflow_id | int | FK → workflows |
| lead_id | int | FK → leads |
| instancia_id | int | FK → whatsapp_instances |
| status | texto | sucesso / erro |
| mensagem_erro | texto (opcional) | motivo do erro, se houver |
| executado_em | data/hora | quando foi disparado |

## Relacionamentos

\`\`\`
usuarios (1) ──── (N) leads
usuarios (1) ──── (N) whatsapp_instances
usuarios (1) ──── (N) workflows
workflows (1) ──── (N) workflow_executions
leads (1) ──── (N) workflow_executions
whatsapp_instances (1) ──── (N) workflow_executions
\`\`\`