

# Melhorar qualidade das ideias do GPT-4o com prompts mais ricos

## Diagnóstico

O GPT-5.4 é mais inteligente e infere muito a partir de pouco contexto. O prompt atual de `generate-content-ideas` é **magro** — só tem um parágrafo de system prompt + `creatorContext`. Não injeta nenhum dos frameworks ricos que existem no `knowledge_base.ts` (roteiros, retenção, diretrizes criativas, exemplos virais, benchmarks).

O GPT-4o precisa de mais contexto explícito para produzir ideias no mesmo nível.

## Mudanças

### 1. `supabase/functions/generate-content-ideas/index.ts`

**System prompt** — injetar os frameworks relevantes para geração de ideias:
- `DIRETRIZES_CRIATIVAS` (pilares de alinhamento, linhas de conteúdo, formato eficiente, processo criativo baseado no ICP)
- `EXEMPLOS_VIRAIS` (case studies reais para o modelo se inspirar)
- `BENCHMARKS_NICHO` (para contextualizar ideias por nicho)

**User prompt** — tornar mais específico e exigente:
- Pedir que cada ideia tenha um ângulo **contraintuitivo ou provocativo** (não genérico)
- Exigir que hooks sejam frases prontas para gravar, não descrições vagas
- Pedir variação explícita entre linhas de conteúdo (atração, autoridade, conversão)
- Incluir instrução de que ideias devem parecer **específicas e vividas**, não templates genéricos
- Adicionar few-shot examples no prompt para calibrar o nível de qualidade esperado

### 2. `supabase/functions/generate-script-from-idea/index.ts`

O prompt de roteiro já é mais rico (usa FRAMEWORK_ROTEIROS, FRAMEWORK_RETENCAO, DIRETRIZES_CRIATIVAS). Ajuste menor:
- Adicionar `EXEMPLOS_VIRAIS` para dar referências concretas de estrutura
- Reforçar no user prompt que o roteiro deve soar **falado e natural**, não escrito

### Arquivos alterados

| Arquivo | Ação |
|---|---|
| `supabase/functions/generate-content-ideas/index.ts` | Enriquecer system+user prompt com frameworks e few-shot |
| `supabase/functions/generate-script-from-idea/index.ts` | Adicionar EXEMPLOS_VIRAIS + reforço de naturalidade |

### Impacto em tokens

O system prompt de ideias vai crescer ~2,000-3,000 tokens de input. Com GPT-4o a $2.50/1M input, isso adiciona ~$0.005-0.008 por chamada — irrelevante. A melhoria de qualidade compensa amplamente.

