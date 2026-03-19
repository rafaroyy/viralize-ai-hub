

# Aplicar Perfil de Criador na Criação de Vídeo

## Situação atual

O `CriarVideo.tsx` envia payloads para a API externa (`api.viralizeia.com/videos/render`) sem nenhum dado do perfil do criador. O toggle de "Análise Personalizada" existe apenas no Analisador Viral.

## O que muda

Adicionar o mesmo padrão do Analisador Viral na página de criação de vídeo: um toggle "Personalizar para meu perfil" que, quando ativo, injeta os dados do criador no payload enviado à API externa.

## Mudanças

### 1. `src/pages/CriarVideo.tsx`

- Importar `useCreatorProfile` e adicionar o hook
- Adicionar estado `usePersonalized` (boolean, default `true` se `hasProfile`)
- Renderizar um Switch "Personalizar para meu perfil" na UI (similar ao do Analisador Viral)
- Se ativado mas sem perfil → toast direcionando para Perfil → Criador
- Nos handlers `handleSubmitAssisted` e `handleSubmitManual`, se `usePersonalized && hasProfile`, adicionar `creator_profile` ao payload:

```typescript
if (usePersonalized && hasProfile) {
  payload.creator_profile = {
    niche: profile.niche,
    sub_niches: profile.sub_niches,
    target_audience: profile.target_audience,
    content_style: profile.content_style,
    tone_of_voice: profile.tone_of_voice,
    goals: profile.goals,
    average_views: profile.average_views,
    // branding
    brand_cause: profile.brand_cause,
    brand_tribe: profile.brand_tribe,
    brand_enemy: profile.brand_enemy,
    brand_archetype: profile.brand_archetype,
    brand_recognition: profile.brand_recognition,
  };
}
```

A API externa receberá esses dados no JSON do payload e poderá usá-los para personalizar roteiros, tom e estilo dos vídeos gerados.

## Arquivos alterados

| Arquivo | Ação |
|---|---|
| `src/pages/CriarVideo.tsx` | Hook + toggle + injeção no payload |

