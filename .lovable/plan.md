

# Plano: Integrar YouTube Data API v3 no Radar de Trends

Conectar a `YOUTUBE_API_KEY` (já configurada nos secrets) ao Radar para buscar vídeos trending reais do Brasil, persistir no banco e exibir dados reais ao lado dos mocks.

---

## Arquitetura

```text
Frontend (RadarTrends)
  → botão "Atualizar YouTube" ou auto-fetch
  → chama edge function radar-youtube-fetch
  → edge function usa YOUTUBE_API_KEY para chamar YouTube Data API v3
  → upsert trends + trend_sources no banco (via service_role)
  → frontend lê dados reais da tabela trends + trend_sources
```

---

## 1. Nova Edge Function: `radar-youtube-fetch`

- Usa `YOUTUBE_API_KEY` para chamar `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=BR&maxResults=50`
- Para cada vídeo trending: upsert na tabela `trends` (usando `external_id` = video ID para deduplicar) e insere em `trend_sources`
- Calcula scores básicos (velocity, novelty, etc.) usando a lógica do scoring engine
- Registra a execução em `trend_fetch_runs`
- Retorna quantidade de trends processados

## 2. Atualizar `radar-ingest` 

- Implementar a lógica real de persistência (já tem as tabelas prontas mas o código é stub)
- O `radar-youtube-fetch` pode chamar internamente o padrão de ingest ou fazer direto

## 3. Frontend: Buscar dados reais do banco

- No `RadarTrendsPage`, adicionar hook `useRadarTrends` que:
  - Busca trends da tabela `trends` com seus `trend_sources` via Supabase client
  - Faz merge com mocks (se banco vazio, usa mocks como fallback)
  - Mapeia colunas do banco para o tipo `Trend` do frontend
- Adicionar botão "Buscar Trends YouTube" na aba Dashboard que invoca `radar-youtube-fetch`
- Mostrar indicador de loading durante fetch

## 4. Config.toml

- Adicionar `[functions.radar-youtube-fetch]` com `verify_jwt = false`

---

## Ficheiros

| Ação | Ficheiro |
|------|----------|
| Criar | `supabase/functions/radar-youtube-fetch/index.ts` |
| Criar | `src/hooks/useRadarTrends.ts` |
| Editar | `src/pages/RadarTrends.tsx` — usar hook real + botão fetch |
| Editar | `src/components/radar/RadarDashboardTab.tsx` — botão atualizar |

---

## Detalhes Técnicos

**Edge Function `radar-youtube-fetch`:**
- Usa `YOUTUBE_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` dos secrets
- Chama YouTube `videos.list` (chart=mostPopular, regionCode=BR, maxResults=50, part=snippet,statistics,contentDetails)
- Para cada vídeo: cria/atualiza trend com label=title, category="assunto", source="youtube", external_id=videoId
- Insere trend_source com url, raw_score (viewCount normalizado), signal_label
- Calcula velocity/novelty scores baseado em publishedAt e viewCount
- Registra run em trend_fetch_runs

**Hook `useRadarTrends`:**
- Query `trends` com join em `trend_sources` 
- Transforma rows do banco no tipo `Trend` do frontend
- Fallback para mockTrends se banco vazio
- Expõe `fetchYouTube()` que invoca a edge function e refaz a query

