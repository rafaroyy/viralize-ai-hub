

# Plano: Radar de Trends (como aba dentro da Viralize)

O Radar de Trends será uma aba na sidebar, igual às outras (Criar Vídeo, Analisador Viral, etc.). A navegação interna entre as sub-telas (dashboard, lista, detalhe, oportunidades, configurações) será feita com **tabs internas** dentro de uma única página principal, e não com sub-rotas separadas. Isso mantém o padrão da app.

---

## Arquitetura

- **1 rota**: `/radar` (protegida, dentro do `ProtectedRoute`)
- **1 página**: `src/pages/RadarTrends.tsx` — com tabs internas (Dashboard, Trends, Oportunidades, Configurações)
- **Detalhe de trend**: abre num drawer/sheet lateral ou modal, sem rota separada
- **1 entrada na sidebar**: ícone `Radar` do lucide, após "Analisador Viral"

Isso segue o padrão existente onde cada item da sidebar é uma página única (ex: AnalisadorViral, AffiliateHub).

---

## Ficheiros a Criar

```text
src/types/radar.ts                          # Tipos (Trend, Opportunity, SourceSignal, etc.)
src/data/radarMocks.ts                      # ~15 trends + ~8 oportunidades mockadas
src/lib/radarScoreEngine.ts                 # Funções puras de scoring
src/pages/RadarTrends.tsx                   # Página principal com tabs
src/components/radar/RadarDashboardTab.tsx   # Tab 1 — KPIs, gráficos, ranking
src/components/radar/RadarTrendsTab.tsx      # Tab 2 — Lista/tabela de trends
src/components/radar/RadarOportunidadesTab.tsx # Tab 3 — Oportunidades
src/components/radar/RadarConfiguracoesTab.tsx # Tab 4 — Configurações
src/components/radar/TrendCard.tsx           # Card de trend
src/components/radar/TrendStatusBadge.tsx    # Badge status
src/components/radar/RiskBadge.tsx           # Badge risco
src/components/radar/ScoreBar.tsx            # Barra de score
src/components/radar/TrendTimeline.tsx       # Timeline
src/components/radar/SourcesBlock.tsx        # Bloco de fontes
src/components/radar/OpportunityBlock.tsx    # Bloco oportunidade
src/components/radar/RadarFilters.tsx        # Filtros globais
src/components/radar/RadarKpiCards.tsx       # KPI cards
src/components/radar/TrendDetailSheet.tsx    # Sheet lateral com detalhe completo
src/components/radar/GenerateHooksModal.tsx  # Modal gerar hooks
src/components/radar/RadarCharts.tsx         # Gráficos recharts
```

## Ficheiros a Editar

- `src/App.tsx` — adicionar rota `/radar`
- `src/components/AppSidebar.tsx` — adicionar link "Radar de Trends" com ícone `Radar`

## Estrutura da Página

A página `/radar` usa o componente `Tabs` (já existente em `src/components/ui/tabs.tsx`) com 4 abas:

1. **Dashboard** — KPIs (total trends, novas 24h, acelerando, caindo, oportunidades), gráficos (volume por fonte, distribuição por categoria, evolução temporal), ranking top 10
2. **Trends** — Tabela avançada com sorting, filtros, ações por linha (ver detalhe no Sheet, gerar hooks, salvar watchlist)
3. **Oportunidades** — Cards de oportunidade com hooks prontos, ideias de vídeo, narrativa, CTA, score
4. **Configurações** — Fontes ativas, frequência, nichos prioritários, palavras/categorias bloqueadas, sensibilidade

O **detalhe da trend** abre num `Sheet` lateral (já existe `src/components/ui/sheet.tsx`) com todas as 11 seções do briefing original.

## Backend (fase 2, depois do front)

- Migração com tabelas: `trends`, `trend_sources`, `trend_snapshots`, `trend_clusters`, `trend_opportunities`, `trend_watchlist`, `trend_settings`, `trend_fetch_runs`, `blocked_terms`, `blocked_categories`
- 4 edge functions stub: `radar-ingest`, `radar-recompute`, `radar-enrich`, `radar-webhook-n8n`
- RLS por `user_id` nas tabelas de watchlist, settings, blocked

## Ordem de Implementação

1. Types + Mocks + Score Engine
2. Componentes reutilizáveis (badges, cards, bars, charts, filters)
3. 4 tabs + página principal + sheet de detalhe + modal
4. Rota + Sidebar
5. Migração DB
6. Edge functions stub

