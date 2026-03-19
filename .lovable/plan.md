

# Migrar Edge Functions de Conteúdo para OpenAI GPT-5.4

## Problema
As duas edge functions (`generate-content-ideas` e `generate-script-from-idea`) usam o Lovable AI Gateway, que está sem créditos (erro 402). O projeto já tem `OPENAI_API_KEY` e `OPENAI_PROJECT_KEY` configurados e funcionando em outras funções (`analyze-viral`, `chat-viralize`, `analyze-script`).

## Mudanças

### 1. `supabase/functions/generate-content-ideas/index.ts`
- Trocar de `https://ai.gateway.lovable.dev` para `https://api.openai.com/v1/chat/completions`
- Usar `OPENAI_API_KEY` + `OPENAI_PROJECT_KEY` (mesmo padrão do `analyze-viral`)
- Modelo: `gpt-5.4` com `max_completion_tokens` (não `max_tokens`)
- Manter tool calling para structured output
- Manter fallback para 402/429

### 2. `supabase/functions/generate-script-from-idea/index.ts`
- Mesma migração: OpenAI direta com `gpt-5.4`
- Usar `max_completion_tokens`
- Manter tool calling para structured output

### Arquivos alterados

| Arquivo | Ação |
|---|---|
| `supabase/functions/generate-content-ideas/index.ts` | Trocar gateway → OpenAI direta |
| `supabase/functions/generate-script-from-idea/index.ts` | Trocar gateway → OpenAI direta |

Nenhuma secret nova necessária — `OPENAI_API_KEY` e `OPENAI_PROJECT_KEY` já existem.

