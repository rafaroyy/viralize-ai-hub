

# Persistir ideias no localStorage

## Abordagem

Usar `localStorage` para salvar e restaurar as listas `ideas` e `dismissedIdeas`, keyed pelo `user_id`. Simples, sem necessidade de novas tabelas no banco.

## Mudanças — `src/pages/Conteudo.tsx`

1. **Ao montar o componente**: Carregar `ideas` e `dismissedIdeas` do localStorage usando chaves `viralize_ideas_{user_id}` e `viralize_dismissed_{user_id}`
2. **Sempre que `ideas` ou `dismissedIdeas` mudam**: Salvar no localStorage via `useEffect`
3. **No reset (primeira geração sem append)**: Limpar dismissed do localStorage também

| Arquivo | Ação |
|---|---|
| `src/pages/Conteudo.tsx` | Adicionar load/save via localStorage com useEffect |

