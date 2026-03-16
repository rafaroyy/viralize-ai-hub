
# README Profissional — Viralize AI

## Análise do projeto

Após explorar o código, identifiquei:

**Nome**: Viralize AI (viralizeia.com)  
**Propósito**: Plataforma SaaS para criação de vídeos virais usando IA, com frameworks proprietários de retenção e conversão

**Stack principal**:
- Frontend: React 18 + TypeScript + Vite
- UI: shadcn-ui + Tailwind CSS + Framer Motion
- Backend: Lovable Cloud (Supabase) com 14 Edge Functions
- Auth: Sistema externo (api.viralizeia.com) com JWT
- DB: PostgreSQL com 15 tabelas (trends, affiliates, oauth_integrations, etc.)

**Funcionalidades principais** (baseado nas rotas + edge functions):
1. **Radar de Trends** — scraping YouTube + análise de oportunidades virais
2. **Analisador Viral** — análise de vídeos com Gemini + fallback para transcrição
3. **Modelar Post** — geração de roteiros usando framework P-C-R
4. **Criar Vídeo** — geração de vídeos com IA usando avatares
5. **Chat IA** — assistente especializado em conteúdo viral
6. **Integração TikTok** — OAuth + gestão de conexões
7. **Sistema de Afiliados** — landing pages personalizadas por slug

**Secrets necessários**:
- `GEMINI_API_KEY` (análise de vídeo)
- `OPENAI_API_KEY` + `OPENAI_PROJECT_KEY` (chat + análise estratégica)
- `N8N_WEBHOOK_URL` (radar webhook)
- `YOUTUBE_API_KEY` (scraping trends)
- `TIKTOK_CLIENT_KEY` + `TIKTOK_CLIENT_SECRET` (OAuth)

## O que vou criar

Um README.md completo com:

1. **Header** — logo + badges + descrição one-liner
2. **Sobre o Projeto** — problema resolvido + diferenciais
3. **Features** — lista das 7 funcionalidades principais com emojis
4. **Stack Tecnológica** — tabela organizada (frontend/backend/cloud)
5. **Pré-requisitos** — Node.js, npm/bun, contas necessárias
6. **Instalação** — clone, install, env setup
7. **Configuração** — secrets detalhados + como obter cada chave
8. **Uso** — como rodar local + deploy + principais comandos
9. **Estrutura de Pastas** — tree das pastas principais
10. **Edge Functions** — tabela descritiva de cada função
11. **Banco de Dados** — lista de tabelas + propósito
12. **Contribuição** — guia para PRs
13. **Membros** — seção dedicada (deixarei placeholder para você preencher nomes)
14. **Licença** — MIT (padrão open source permissivo)
15. **Roadmap** — features planejadas (baseado em funcionalidades existentes)

## Diferencial

- Formatação Markdown profissional com emojis estratégicos
- Tabelas para melhor organização visual
- Seção de troubleshooting comum
- Links úteis (docs Supabase, APIs usadas)
- Instruções claras de como obter cada API key
- Destaque para frameworks proprietários (P-C-R, HDC, PPMO)

## Arquivos

Substituirá completamente o `README.md` atual (que é template genérico do Lovable).
