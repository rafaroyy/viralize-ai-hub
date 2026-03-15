

# Plano: Remover mocks, usar YouTube API real, marcar outras fontes como "Em breve"

## Problema Atual
A YouTube API está funcionando (busca 50 vídeos), mas o **upsert falha** porque os unique indexes em `trends.external_id` e `trend_sources.external_id` são **parciais** (`WHERE external_id IS NOT NULL`), e o PostgREST não suporta `onConflict` com partial indexes. Resultado: 0 vídeos processados.

## Plano

### 1. Corrigir unique constraints no banco (migration)
- Dropar os partial indexes existentes
- Criar **constraints UNIQUE reais** em `trends.external_id` e `trend_sources.external_id`
- Isso permite o `upsert` com `onConflict` funcionar corretamente

### 2. Remover mock data e fallbacks
- **`src/data/radarMocks.ts`**: Remover `mockTrends` e `mockOpportunities`. Manter apenas os dicionários de labels (`sourceLabels`, `statusLabels`, `categoryLabels`, `nicheLabels`)
- **`src/hooks/useRadarTrends.ts`**: Remover fallback para mocks. Iniciar com arrays vazios. Remover import de mocks

### 3. Adaptar UI para dados reais do YouTube
- **`useRadarTrends.ts`**: Iniciar `trends` como `[]` em vez de `mockTrends`, `opportunities` como `[]`
- **`RadarDashboardTab`**: Mostrar estado vazio quando não há trends ("Clique em Atualizar YouTube para buscar trends reais")
- **`RadarOportunidadesTab`**: Mostrar mensagem "Em breve — oportunidades serão geradas automaticamente com IA" quando vazio

### 4. Marcar fontes não-YouTube como "Em breve"
- **`RadarFilters`**: No select de fontes, mostrar YouTube como ativa e Google/TikTok/Notícias com "(Em breve)" no label
- **`RadarConfiguracoesTab`**: Nos switches de fontes, desabilitar Google/TikTok/Notícias com badge "Em breve", manter YouTube como única ativa
- **`sourceLabels`**: Atualizar para incluir indicador visual nas fontes indisponíveis

### 5. Melhorar edge function (robustez)
- Na edge function, se o upsert de trend falhar, logar e usar `insert` como fallback (para o caso de primeiro insert)

---

## Ficheiros

| Ação | Ficheiro |
|------|----------|
| Migration | Dropar partial indexes, criar UNIQUE constraints reais |
| Editar | `src/data/radarMocks.ts` — remover mocks, manter labels |
| Editar | `src/hooks/useRadarTrends.ts` — remover fallback mock |
| Editar | `src/components/radar/RadarDashboardTab.tsx` — estado vazio |
| Editar | `src/components/radar/RadarOportunidadesTab.tsx` — "Em breve" |
| Editar | `src/components/radar/RadarFilters.tsx` — fontes "Em breve" |
| Editar | `src/components/radar/RadarConfiguracoesTab.tsx` — fontes "Em breve" |

