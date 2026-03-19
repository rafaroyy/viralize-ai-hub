

# Marketplace de Ideias — Gerar +3, Excluir e Aprender Preferências

## Resumo

Transformar o fluxo de "gerar tudo de novo" para um sistema incremental: o usuário gera mais 3 ideias por vez (append), pode excluir ideias individualmente, e ao gerar novas preenche um popup com contexto adicional. As ideias descartadas e mantidas alimentam o agente para personalizar melhor as próximas.

## Mudanças

### 1. Frontend — `src/pages/Conteudo.tsx`

**Popup "Gerar Mais Ideias"** (Dialog):
- Botão "Gerar Mais" abre um Dialog com campos:
  - "Sobre o que você quer criar?" (textarea, obrigatório)
  - "Formato preferido" (select opcional: tutorial, storytelling, etc.)
  - "Tom" (input opcional)
  - "Evitar algo?" (input opcional — temas que não quer)
- Ao confirmar, chama a edge function com esses dados + títulos das ideias existentes (para evitar repetição) + títulos das descartadas (para o agente aprender o que não funciona)

**Modo seleção / exclusão**:
- Cada card de ideia ganha um botão de "X" (trash/close) no canto superior para descartar
- Ao clicar, remove do array `ideas` e adiciona ao array `dismissedIdeas` (state local)
- Contador atualiza automaticamente

**Gerar incremental (append)**:
- `generateIdeas` deixa de fazer `setIdeas([])` — passa a fazer `setIdeas(prev => [...prev, ...newIdeas])`
- Edge function recebe `existing_titles` e `dismissed_titles` no body

**Estado inicial**:
- Primeiro acesso (ideas vazio) mantém o empty state atual, mas o botão inicial gera 6-10 ideias normalmente (sem popup)
- Popup só aparece no botão "Gerar Mais" quando já existem ideias

### 2. Edge Function — `supabase/functions/generate-content-ideas/index.ts`

- Aceitar novos campos no body: `prompt_context`, `preferred_format`, `preferred_tone`, `avoid_topics`, `existing_titles`, `dismissed_titles`
- Adicionar ao user prompt:
  - "O criador JÁ tem essas ideias: [títulos]. NÃO repita nenhuma."
  - "O criador DESCARTOU essas ideias: [títulos]. Entenda o padrão do que ele não gosta e evite ideias similares."
  - "O criador pediu especificamente: [prompt_context]"
  - Se `preferred_format`: "Foque no formato: X"
  - Se `avoid_topics`: "Evite os seguintes temas: X"
- Mudar a instrução de quantidade para "gere exatamente 3 ideias" quando `existing_titles` existir (append mode)
- Manter 6-10 para primeira geração (sem `existing_titles`)

### Arquivos alterados

| Arquivo | Ação |
|---|---|
| `src/pages/Conteudo.tsx` | Dialog de contexto, exclusão de ideias, append incremental |
| `supabase/functions/generate-content-ideas/index.ts` | Aceitar novos campos, ajustar prompt para append + preferências |

