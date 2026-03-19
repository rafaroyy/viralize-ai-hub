

# Personal Branding — Seção Avançada no Perfil de Criador

## Visão geral

Adicionar uma seção colapsável "Personal Branding (Avançado)" no formulário de criador, com campos baseados no framework de Posicionamento Magnético. Esses dados serão persistidos no banco e injetados nos prompts de análise viral para avaliar se o conteúdo está alinhado com a marca pessoal do criador.

## Campos do Personal Branding

Baseados nos 5 pilares do posicionamento:

| Campo | Tipo | Placeholder / Descrição |
|---|---|---|
| **Causa** | textarea | "Qual visão de mundo você defende? Ex: Jovens não precisam esperar 10 anos pra ganhar dinheiro" |
| **Tribo** | textarea | "Quem é o público que se identifica com você? Ex: Empreendedores iniciantes cansados de guru" |
| **Inimigo em comum** | textarea | "O que sua audiência rejeita? Ex: Promessas milagrosas, gurus sem prova" |
| **Arquétipo** | select (Mentor, Rebelde, Executor, Visionário, Provocador) | Como você se comporta |
| **História de origem** | textarea | "Resuma sua trajetória: de onde veio, o conflito e a transformação" |
| **Reconhecimento desejado** | input | "Por que quer ser lembrado? Ex: O mais prático, o que realmente executa" |
| **Ponto fraco do concorrente** | textarea | "Qual o ponto fraco dos seus concorrentes que você transforma em força?" |

## Mudanças

### 1. Migration SQL
Adicionar 7 colunas na tabela `creator_profiles`:
- `brand_cause text DEFAULT ''`
- `brand_tribe text DEFAULT ''`
- `brand_enemy text DEFAULT ''`
- `brand_archetype text DEFAULT ''`
- `brand_origin_story text DEFAULT ''`
- `brand_recognition text DEFAULT ''`
- `brand_competitor_weakness text DEFAULT ''`

### 2. `useCreatorProfile.ts`
Expandir a interface `CreatorProfile` com os 7 campos novos e atualizar EMPTY_PROFILE, fetch e save.

### 3. `CreatorProfileForm.tsx`
Adicionar uma seção colapsável (Collapsible) "Personal Branding (Avançado)" abaixo dos campos existentes e acima do botão Salvar, com os 7 campos novos.

### 4. `analyze-viral/index.ts`
No bloco de contexto do criador, se os campos de branding estiverem preenchidos, adicionar:
```
## POSICIONAMENTO / MARCA PESSOAL
- Causa: {brand_cause}
- Tribo: {brand_tribe}
- Inimigo em comum: {brand_enemy}
- Arquétipo: {brand_archetype}
- História: {brand_origin_story}
- Reconhecimento desejado: {brand_recognition}

Avalie se o vídeo está ALINHADO com o posicionamento declarado.
O conteúdo reforça a causa e fala com a tribo certa?
O tom é coerente com o arquétipo escolhido?
```

## Arquivos alterados

| Arquivo | Ação |
|---|---|
| Migration SQL | ADD COLUMN x7 em `creator_profiles` |
| `src/hooks/useCreatorProfile.ts` | Expandir interface + fetch/save |
| `src/components/profile/CreatorProfileForm.tsx` | Seção colapsável com 7 campos |
| `supabase/functions/analyze-viral/index.ts` | Injetar contexto de branding nos prompts |

