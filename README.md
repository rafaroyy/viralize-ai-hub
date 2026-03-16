<p align="center">
  <img src="src/assets/logo-viralize.png" alt="Viralize AI" width="220" />
</p>

<h1 align="center">Viralize AI</h1>

<p align="center">
  Plataforma de criação de vídeos virais com inteligência artificial.<br/>
  Frameworks proprietários de retenção e conversão para criadores de conteúdo.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## 📖 Sobre o Projeto

O **Viralize AI** resolve um problema comum de criadores de conteúdo: transformar ideias em vídeos virais de forma rápida e estratégica. A plataforma combina análise de tendências em tempo real, inteligência artificial generativa e frameworks proprietários de roteirização (P-C-R, HDC, PPMO) para maximizar retenção e conversão.

### Diferenciais

- **Radar de Trends** com scraping automatizado do YouTube Brasil
- **Análise viral** de vídeos usando visão computacional (Gemini) com fallback inteligente
- **Frameworks proprietários** de roteiro: Pergunta-Conflito-Resposta, Hook-Desenvolvimento-CTA, PPMO
- **Geração de vídeos com avatares IA** integrada
- **Sistema de afiliados** com landing pages dinâmicas

---

## ✨ Funcionalidades

| # | Feature | Descrição |
|---|---------|-----------|
| 🔍 | **Radar de Trends** | Monitora tendências do YouTube BR em tempo real, calcula scores de viralidade, velocidade e potencial comercial |
| 🎯 | **Analisador Viral** | Analisa vídeos com IA (Gemini) — hook, corpo, CTA, retenção. Fallback automático via transcrição |
| ✍️ | **Modelar Post** | Gera roteiros virais usando frameworks P-C-R a partir de URLs de vídeos de referência |
| 🎬 | **Criar Vídeo** | Cria vídeos com avatares IA, incluindo upload de mídia e geração automatizada |
| 💬 | **Chat IA** | Assistente especializado em estratégias de conteúdo viral |
| 📱 | **Integração TikTok** | Conexão OAuth com gestão de escopos e refresh automático de tokens |
| 🤝 | **Sistema de Afiliados** | Landing pages personalizadas por slug com checkout dinâmico |

---

## 🛠 Stack Tecnológica

### Frontend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | 18.3 | UI framework |
| TypeScript | 5.8 | Tipagem estática |
| Vite | 5.4 | Build tool |
| Tailwind CSS | 3.4 | Estilização |
| shadcn/ui | — | Componentes base |
| Framer Motion | 12.x | Animações |
| React Router | 6.x | Roteamento SPA |
| TanStack Query | 5.x | Gerenciamento de estado servidor |
| Recharts | 2.x | Gráficos e visualizações |

### Backend

| Tecnologia | Uso |
|-----------|-----|
| Supabase (PostgreSQL) | Banco de dados + Auth |
| Edge Functions (Deno) | APIs serverless |
| Gemini API | Análise de vídeo com visão computacional |
| OpenAI API | Chat IA + análise estratégica |
| YouTube Data API | Scraping de tendências |
| TikTok API | Integração OAuth |

---

## 📋 Pré-requisitos

- **Node.js** >= 18 (ou **Bun** >= 1.0)
- **npm** >= 9 (ou **bun**)
- **Git**
- Conta no **Supabase** (ou Lovable Cloud)
- Chaves de API (ver seção [Configuração](#-configuração))

---

## 🚀 Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/viralize-ai.git

# 2. Entre no diretório
cd viralize-ai

# 3. Instale as dependências
npm install
# ou
bun install

# 4. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=seu-project-id
```

### Secrets (Edge Functions)

As seguintes chaves devem ser configuradas como secrets no backend:

| Secret | Obrigatório | Onde obter | Usado por |
|--------|-------------|------------|-----------|
| `GEMINI_API_KEY` | ✅ | [Google AI Studio](https://aistudio.google.com/apikey) | Analisador Viral |
| `OPENAI_API_KEY` | ✅ | [OpenAI Platform](https://platform.openai.com/api-keys) | Chat IA, Modelar Post |
| `OPENAI_PROJECT_KEY` | ✅ | OpenAI Platform → Projects | Chat IA |
| `YOUTUBE_API_KEY` | ✅ | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) | Radar de Trends |
| `TIKTOK_CLIENT_KEY` | ⚠️ Opcional | [TikTok for Developers](https://developers.tiktok.com/) | Integração TikTok |
| `TIKTOK_CLIENT_SECRET` | ⚠️ Opcional | TikTok for Developers | Integração TikTok |
| `N8N_WEBHOOK_URL` | ⚠️ Opcional | Sua instância n8n | Radar webhook |

---

## 📁 Estrutura de Pastas

```
viralize-ai/
├── public/                    # Assets estáticos
├── src/
│   ├── assets/                # Imagens e mídia
│   ├── components/
│   │   ├── integrations/      # Componentes de integração (TikTok)
│   │   ├── radar/             # Componentes do Radar de Trends
│   │   └── ui/                # shadcn/ui + componentes customizados
│   ├── contexts/              # AuthContext
│   ├── data/                  # Dados mock (radar)
│   ├── hooks/                 # Custom hooks
│   ├── integrations/supabase/ # Client + tipos auto-gerados
│   ├── lib/                   # Utilitários (API, PDF, scoring)
│   ├── pages/                 # Páginas da aplicação
│   └── types/                 # Tipos TypeScript
├── supabase/
│   └── functions/             # Edge Functions (Deno)
│       ├── analyze-script/    # Análise de roteiro
│       ├── analyze-viral/     # Análise viral (Gemini)
│       ├── chat-viralize/     # Chat IA
│       ├── model-post/        # Modelagem de post
│       ├── radar-enrich/      # Enriquecimento de trends
│       ├── radar-ingest/      # Ingestão de dados
│       ├── radar-recompute/   # Recálculo de scores
│       ├── radar-webhook-n8n/ # Webhook n8n
│       ├── radar-youtube-fetch/ # Fetch YouTube trending
│       ├── tiktok-callback/   # OAuth callback
│       ├── tiktok-connect/    # Início OAuth
│       ├── tiktok-disconnect/ # Desconexão
│       └── tiktok-refresh/    # Refresh de token
└── README.md
```

---

## 🗄 Banco de Dados

| Tabela | Propósito |
|--------|-----------|
| `affiliates` | Afiliados com slugs e links de checkout |
| `analysis_cache` | Cache de análises virais por URL |
| `blocked_categories` | Categorias bloqueadas pelo usuário no Radar |
| `blocked_terms` | Termos bloqueados pelo usuário no Radar |
| `oauth_integrations` | Conexões OAuth (TikTok) |
| `oauth_states` | Estados temporários de fluxo OAuth |
| `trends` | Tendências detectadas com scores |
| `trend_clusters` | Agrupamentos de tendências relacionadas |
| `trend_fetch_runs` | Log de execuções de fetch |
| `trend_opportunities` | Oportunidades comerciais por trend |
| `trend_settings` | Configurações do Radar por usuário |
| `trend_snapshots` | Histórico de scores de trends |
| `trend_sources` | Fontes individuais de cada trend |
| `trend_watchlist` | Trends favoritadas pelo usuário |
| `user_history` | Histórico de ações do usuário |

---

## 🔌 Edge Functions

| Função | Método | Descrição |
|--------|--------|-----------|
| `analyze-viral` | POST | Analisa vídeo com Gemini (visão) + fallback por transcrição |
| `analyze-script` | POST | Analisa roteiro/transcrição com IA |
| `chat-viralize` | POST | Chat IA especializado em conteúdo viral |
| `model-post` | POST | Gera roteiro viral a partir de referência |
| `radar-youtube-fetch` | POST | Busca trending videos do YouTube BR |
| `radar-ingest` | POST | Ingere dados de fontes externas |
| `radar-enrich` | POST | Enriquece trends com IA |
| `radar-recompute` | POST | Recalcula scores de trends |
| `radar-webhook-n8n` | POST | Recebe dados do n8n |
| `tiktok-connect` | POST | Inicia fluxo OAuth TikTok |
| `tiktok-callback` | POST | Processa callback OAuth |
| `tiktok-disconnect` | POST | Remove conexão TikTok |
| `tiktok-refresh` | POST | Renova token TikTok |

---

## 💻 Uso

### Comandos disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor local (Vite)

# Build
npm run build        # Build de produção
npm run build:dev    # Build de desenvolvimento

# Testes
npm run test         # Executa testes (Vitest)
npm run test:watch   # Testes em modo watch

# Lint
npm run lint         # Verifica código (ESLint)

# Preview
npm run preview      # Preview do build
```

### Deploy

O deploy é feito automaticamente via **Lovable**:

1. Acesse o projeto no Lovable
2. Clique em **Share → Publish**
3. A aplicação será publicada com SSL automático

---

## 🤝 Contribuição

Contribuições são bem-vindas! Siga os passos:

1. Faça um **fork** do projeto
2. Crie uma branch para sua feature: `git checkout -b feat/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona minha feature'`
4. Push para a branch: `git push origin feat/minha-feature`
5. Abra um **Pull Request**

### Convenções

- **Commits**: siga [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`)
- **Código**: TypeScript strict, componentes funcionais, hooks customizados
- **Estilo**: Tailwind CSS com tokens semânticos do design system

---

## 👥 Membros

| Nome | Role |
|------|------|
| Rafael Roy | Fundador / Full-stack |
| Maria Clara | Desenvolvedora |
| Thalis | Desenvolvedor |

---

## 🗺 Roadmap

- [ ] Integração com Instagram Reels
- [ ] Análise de concorrentes automatizada
- [ ] Dashboard de métricas pós-publicação
- [ ] Suporte a múltiplos idiomas
- [ ] Editor de vídeo integrado
- [ ] Notificações push para trends relevantes
- [ ] API pública para integrações externas

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** — veja o arquivo [LICENSE](LICENSE) abaixo.

```
MIT License

Copyright (c) 2025 Viralize AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Feito com 💜 pela equipe <strong>Viralize AI</strong>
</p>
