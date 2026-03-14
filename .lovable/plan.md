

# Migração: Analisador Viral + Modelador de Post

## Escopo

Migrar as funcionalidades **Analisador Viral** (análise de vídeos com score P-C-R) e **Modelador de Post** (análise de imagem + copy com gatilhos mentais) do projeto "Insta Design Clone" para este projeto Viralize AI. Inclui banco de dados, edge functions, knowledge base, páginas, e rotas.

**Nota:** O projeto de referência usa autenticação Supabase Auth (email/password). Este projeto usa autenticação via API externa (api.viralizeia.com). A migração adaptará as funcionalidades para funcionar com o auth system existente -- salvando no histórico quando possível via Supabase Auth como camada adicional, ou desabilitando o save de histórico se o user não tiver sessão Supabase.

---

## Etapas de Implementação

### 1. Banco de Dados -- Tabela `user_history` + Storage Bucket

Criar via migration:
- Tabela `user_history` (id, user_id, tipo, titulo, payload, created_at) com RLS para insert/select/delete
- Storage bucket `videos` (público, para upload de vídeos do analisador viral)

**Decisão importante:** Como o auth atual é via API externa (não Supabase Auth), o `user_history` não poderá usar `auth.uid()`. A tabela será criada mas o salvamento no histórico será condicional -- só funciona se o usuário também tiver sessão Supabase. Alternativamente, podemos criar a tabela sem RLS estrito para funcionar com o sistema atual.

### 2. Edge Functions -- Motor Cognitivo

Criar 3 arquivos:
- **`supabase/functions/_shared/knowledge_base.ts`** -- Base de conhecimento RAG (frameworks P-C-R, diretrizes criativas)
- **`supabase/functions/analyze-viral/index.ts`** -- Análise viral usando Lovable AI gateway (gemini-2.5-flash) com function calling
- **`supabase/functions/model-post/index.ts`** -- Modelagem de post com análise de imagem via Lovable AI gateway

Ambas usam `LOVABLE_API_KEY` (já configurada). Sem dependências pesadas -- apenas imports de `deno.land/std`.

Atualizar `supabase/config.toml` para registrar as novas functions.

### 3. Dependências npm

Adicionar ao `package.json`:
- `html2canvas` -- Export PDF/PNG dos resultados
- `jspdf` -- Export PDF

### 4. Páginas Front-end

Criar 3 novas páginas:
- **`src/pages/AnalisadorViral.tsx`** -- Réplica completa do ViralAnalyzer (603 linhas): upload de vídeo, formulário, ScoreRing, breakdown Hook/Body/CTA, Blueprint de Execução, retenção, export PDF
- **`src/pages/ModelarPost.tsx`** -- Réplica do Index/ModelarPost (496 linhas): upload de imagem, campos de contexto (nicho, objetivo, tom, público), copy modelado, gatilhos mentais
- **`src/pages/Historico.tsx`** -- Histórico de análises/modelos salvos

### 5. Navegação e Rotas

- Adicionar 3 novos links na sidebar (`AppSidebar.tsx`): Analisador Viral, Modelar Post, Histórico
- Adicionar 3 novas rotas protegidas no `App.tsx`
- Adaptar imports de `useAuth` para usar o contexto existente deste projeto

### 6. Adaptações de Integração

- As páginas usarão `supabase.functions.invoke()` para chamar as edge functions
- Upload de vídeo via `supabase.storage.from('videos').upload()`
- O histórico salvará via `supabase.from('user_history').insert()` (requer sessão Supabase ativa)
- Adaptar `useAuth` imports de `@/hooks/useAuth` → `@/contexts/AuthContext`

---

## Arquivos a Criar/Modificar

| Ação | Arquivo |
|------|---------|
| Criar | `supabase/functions/_shared/knowledge_base.ts` |
| Criar | `supabase/functions/analyze-viral/index.ts` |
| Criar | `supabase/functions/model-post/index.ts` |
| Criar | `src/pages/AnalisadorViral.tsx` |
| Criar | `src/pages/ModelarPost.tsx` |
| Criar | `src/pages/Historico.tsx` |
| Modificar | `src/App.tsx` (adicionar rotas) |
| Modificar | `src/components/AppSidebar.tsx` (adicionar nav links) |
| Modificar | `package.json` (adicionar html2canvas, jspdf) |
| Migration | Tabela `user_history` + bucket `videos` |
| Config | `supabase/config.toml` (registrar functions) |

