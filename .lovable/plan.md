

# Fix: Textos Garbled/Corrompidos nas Ideias

## Diagnóstico

O GPT-4o está retornando unicode corrompido (`n03o` em vez de `não`, `neg6ocios` em vez de `negócios`). Duas causas:

1. **Enum com acentos no tool schema** — valores como `"polêmica"`, `"reação"`, `"tendência"` no schema de tool calling confundem o modelo e ele produz escape sequences malformadas (`\u00006o` etc.)
2. **`max_tokens: 3000` insuficiente** — o prompt ficou muito maior após injetar os frameworks, e o modelo trunca a resposta gerando lixo nas últimas ideias

## Mudanças — `supabase/functions/generate-content-ideas/index.ts`

1. **Remover acentos dos enum values no tool schema**: `"polemica"`, `"reacao"`, `"tendencia"`, `"comparacao"` — o modelo entende perfeitamente e não corrompe a saída
2. **Aumentar `max_tokens` para 4500** para acomodar o prompt expandido
3. **Adicionar sanitização pós-resposta**: função que detecta e limpa caracteres unicode corrompidos antes de retornar ao frontend
4. **Atualizar as referências no user prompt** para usar os mesmos valores ASCII nos exemplos de categorias

| Arquivo | Ação |
|---|---|
| `supabase/functions/generate-content-ideas/index.ts` | Fix enum, aumentar tokens, sanitizar output |

