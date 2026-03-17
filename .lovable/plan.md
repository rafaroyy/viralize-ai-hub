

# Nova aba "Clipador" no Radar de Trends

## O que existe hoje

Os dados do YouTube já armazenam em `raw_payload`: `videoId`, `channelTitle`, `categoryId`, `thumbnail`. Além disso, cada trend tem `label` (título do vídeo), `summary` (views), scores de velocidade/viral/saturação, `related_terms` (tags), e a URL do vídeo em `trend_sources.url`. Tudo necessário para montar a aba sem precisar de migration.

## O que vou criar

### 1. Nova aba "Clipador" na TabsList do Radar

Adicionar entre "Oportunidades" e "Configurações" em `RadarTrendsPage`:
```
Dashboard | Trends | Oportunidades | 🎬 Clipador | Configurações
```

### 2. Componente `RadarClipadorTab`

Novo arquivo `src/components/radar/RadarClipadorTab.tsx` com:

**Seção 1 — Top Vídeos para Clipar** (grid de cards visuais)
- Thumbnail do vídeo (de `raw_payload.thumbnail`)
- Título do vídeo + canal
- Badge de "potencial de clip" (calculado: alto velocityScore + alto viralPotentialScore + baixa saturação = melhor para clipar)
- Views formatadas
- Link direto para o YouTube
- Score de "clipabilidade" (fórmula: velocity * 0.35 + viralPotential * 0.35 + novelty * 0.2 + (100 - saturation) * 0.1)

**Seção 2 — Polêmicas & Menções Quentes** (lista compacta)
- Trends com `riskScore >= 30` OU `status === "pico"` — são as polêmicas/tendências que geram engajamento
- Card com: label, por que é quente (summary), tags relacionadas para usar como palavras-chave no vídeo
- Ícone de "fogo" para polêmicas ativas

**Seção 3 — Ideias de Corte por Trend** (accordion ou lista)
- Para cada top trend, sugestões prontas de:
  - "Mencione X no seu vídeo" (termos relacionados de alta busca)
  - Ângulos de corte sugeridos (baseado nos `recommendedAngles` já existentes)
  - Hashtags sugeridas (derivadas dos `aliases` e `relatedTerms`)

### 3. Lógica de filtragem e ordenação

- Filtrar apenas trends com `raw_payload.videoId` (são vídeos reais do YouTube)
- Ordenar por score de "clipabilidade" (novo cálculo local, sem banco)
- Os filtros gerais do Radar (busca, categoria, etc.) continuam funcionando

### 4. Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/RadarTrends.tsx` | Adicionar aba "Clipador" na TabsList + TabsContent |
| `src/components/radar/RadarClipadorTab.tsx` | **Novo** — componente completo da aba |

Nenhuma migration de banco necessária — todos os dados já existem nas tabelas `trends` e `trend_sources`.

