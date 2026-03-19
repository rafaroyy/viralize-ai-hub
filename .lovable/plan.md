

# Trocar modelo GPT-5.4 → GPT-4o nas Edge Functions de Conteúdo

Trocar o modelo de `gpt-5.4` para `gpt-4o` e ajustar o parâmetro de tokens (`max_completion_tokens` → `max_tokens`) nas duas funções:

| Arquivo | Mudança |
|---|---|
| `supabase/functions/generate-content-ideas/index.ts` | `model: "gpt-4o"`, `max_tokens: 3000` |
| `supabase/functions/generate-script-from-idea/index.ts` | `model: "gpt-4o"`, `max_tokens: 3000` |

Remover o header `OpenAI-Project` se não for necessário para 4o (manter não causa erro, então pode ficar).

