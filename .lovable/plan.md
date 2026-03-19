

# Nova Feature: Conteúdo — Marketplace de Ideias Personalizadas

## Visão geral

Uma nova página `/conteudo` com uma aba na sidebar que funciona como um **marketplace de ideias e ângulos personalizados**. A IA cruza os dados do histórico do usuário (vídeos gerados, análises feitas) com o perfil do criador para gerar ideias de conteúdo que a pessoa pode explorar, personalizar e transformar em roteiro.

## Fluxo do usuário

```text
1. Usuário acessa /conteudo
2. Clica em "Gerar Ideias" → IA analisa histórico + perfil
3. Recebe um grid de cards com ideias (título, ângulo, hook, formato)
4. Pode filtrar por categoria (ex: polêmica, tutorial, storytelling)
5. Clica em uma ideia → abre painel de personalização
6. Pode editar título, tom, ângulo, público
7. Clica "Gerar Roteiro" → IA gera roteiro completo personalizado
8. Pode copiar, salvar ou enviar direto para Criar Vídeo
```

## Mudanças técnicas

### 1. Nova Edge Function: `generate-content-ideas`

- Recebe: `user_id`
- Busca do banco: últimos 20 registros de `user_history` (análises + vídeos) e `creator_profiles`
- Monta prompt com contexto do histórico + perfil (usando `buildCreatorRAGContext`)
- Pede à IA (Lovable AI Gateway, modelo `google/gemini-3-flash-preview`) para gerar 6-10 ideias no formato JSON estruturado (via tool calling)
- Cada ideia contém: `title`, `angle`, `hook`, `format`, `category`, `why_now`, `target_emotion`
- Retorna array de ideias

### 2. Nova Edge Function: `generate-script-from-idea`

- Recebe: `idea` (objeto da ideia selecionada) + `customizations` (edições do usuário) + `user_id`
- Busca `creator_profiles` para injetar contexto personalizado
- Usa knowledge base (frameworks P-C-R, retenção, diretrizes criativas) + perfil do criador
- Gera roteiro completo personalizado via Lovable AI Gateway
- Retorna: `hook`, `body` (com timestamps), `cta`, `captions_suggestions`, `duration_suggestion`

### 3. Nova página: `src/pages/Conteudo.tsx`

**Estado inicial**: botão "Gerar Ideias" centralizado com explicação

**Após gerar**:
- Grid de cards (2-3 colunas) com as ideias
- Cada card mostra: título, ângulo, hook sugerido, formato, emoção-alvo e badge de categoria
- Filtros por categoria no topo
- Click no card → abre Sheet/Drawer lateral com:
  - Campos editáveis (título, ângulo, tom, público)
  - Botão "Gerar Roteiro"
  - Área de resultado do roteiro (markdown renderizado)
  - Botões: Copiar, Salvar no Histórico, Usar em Criar Vídeo

### 4. Sidebar: nova entrada

- Ícone: `Lightbulb`
- Label: "Conteúdo"
- Href: `/conteudo`
- Posição: após "Analisador Viral"

### 5. Rota protegida

- Adicionar em `App.tsx` dentro do `<ProtectedRoute />`

### 6. Config.toml

- Adicionar as duas novas funções com `verify_jwt = false`

## Arquivos criados/alterados

| Arquivo | Ação |
|---|---|
| `supabase/functions/generate-content-ideas/index.ts` | Nova edge function |
| `supabase/functions/generate-script-from-idea/index.ts` | Nova edge function |
| `src/pages/Conteudo.tsx` | Nova página |
| `src/components/AppSidebar.tsx` | Adicionar link "Conteúdo" |
| `src/App.tsx` | Adicionar rota `/conteudo` |
| `supabase/config.toml` | Registrar as 2 novas functions |

## Tom de linguagem

Toda a UI e os prompts da IA seguem o mesmo tom didático já implementado — sem jargões técnicos, linguagem simples e direta, como se estivesse conversando com um criador iniciante.

