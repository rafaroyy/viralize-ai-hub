

# Integração do Perfil de Criador no Static RAG

## Situação atual

O contexto do criador é **apenas apendado no final** dos prompts do Gemini e OpenAI como texto extra. Não há integração real com o RAG — os frameworks (P-C-R, benchmarks, cases, etc.) são genéricos e não mudam com base no perfil. O agente recebe os dados do criador mas não tem instrução clara de **priorizar** esses dados nas recomendações, ideias de vídeo e melhorias.

## O que muda

Criar uma função `buildCreatorRAGContext()` no `knowledge_base.ts` que gera um bloco RAG condicional. Quando o perfil está ativo, esse bloco **substitui as instruções genéricas** por instruções personalizadas que priorizam o nicho, público, posicionamento e tom do criador.

## Plano

### 1. `knowledge_base.ts` — Nova função exportada

```typescript
export function buildCreatorRAGContext(profile?: CreatorProfile): string
```

Se `profile` é null/vazio → retorna string vazia (comportamento padrão, sem personalização).

Se `profile` tem dados → retorna um bloco RAG completo:

```
## MODO PERSONALIZADO — ATIVO

PRIORIDADE MÁXIMA: Todas as análises, sugestões de melhoria e ideias de vídeo
devem ser filtradas pelo contexto deste criador.

### Perfil do Criador
- Nicho: {niche} | Sub-nichos: {sub_niches}
- Público-alvo: {target_audience}
- Estilo: {content_style}
- Plataformas: {platforms}
- Tom de voz: {tone_of_voice}
- Média de views: {average_views}
- Objetivo: {goals}

### Instruções de Personalização
1. BENCHMARKS: Use APENAS os benchmarks do nicho "{niche}" como referência
2. IDEIAS DE VÍDEO: Todas as viralVideoIdeas devem ser relevantes para o nicho e público declarados
3. MELHORIAS: Tips e feedback devem considerar o estilo e tom do criador
4. SUMMARY: Mencione como o vídeo se encaixa (ou não) no posicionamento do criador
5. HOOKS: Sugira hooks que funcionem para o público-alvo específico

[Se branding preenchido:]
### Posicionamento de Marca
- Causa: {brand_cause}
- Tribo: {brand_tribe}
- Inimigo: {brand_enemy}
- Arquétipo: {brand_archetype}
- Reconhecimento: {brand_recognition}
- Fraqueza do concorrente: {brand_competitor_weakness}

### Instruções de Alinhamento de Marca
6. Avalie se o vídeo REFORÇA ou ENFRAQUECE o posicionamento declarado
7. O tom é coerente com o arquétipo {archetype}?
8. O conteúdo fala com a tribo certa ou está genérico?
9. O vídeo diferencia o criador no ponto declarado vs concorrentes?
10. Inclua no summary uma nota sobre alinhamento com a marca pessoal
```

### 2. `analyze-viral/index.ts` — Substituir injeção manual

Remover os blocos manuais de `creatorContext` (linhas 216-247) e substituir por:

```typescript
import { buildCreatorRAGContext } from "../_shared/knowledge_base.ts";

const creatorContext = buildCreatorRAGContext(creatorProfile);
```

Esse bloco é injetado nos dois prompts (Gemini e OpenAI) da mesma forma que já é hoje, mas agora vem da função centralizada com instruções muito mais específicas de priorização.

### 3. Lógica condicional clara

```text
creatorProfile preenchido e ativo?
  ├─ SIM → buildCreatorRAGContext() retorna bloco completo
  │        → Agentes priorizam nicho, público, tom, marca
  │        → Ideas, tips e summary são personalizados
  │
  └─ NÃO → buildCreatorRAGContext() retorna ""
           → Análise padrão genérica (como já funciona hoje)
```

## Arquivos alterados

| Arquivo | Ação |
|---|---|
| `supabase/functions/_shared/knowledge_base.ts` | Nova função `buildCreatorRAGContext()` |
| `supabase/functions/analyze-viral/index.ts` | Substituir blocos manuais pela função centralizada |

