

# Plano: Infraestrutura OAuth TikTok

Criar a experiência completa de conexão TikTok como uma nova aba "Integrações" dentro da página de Perfil existente, mais uma rota de callback, edge functions preparadas e tabelas de persistência.

---

## Arquitetura

- **Integrações**: Nova seção dentro de `/perfil` (usando tabs: Perfil | Integrações), sem criar rota separada — mantém o padrão da app
- **Callback**: Rota pública `/auth/tiktok/callback` que lê query params e mostra feedback visual
- **Edge Functions**: 4 stubs (`tiktok-connect`, `tiktok-callback`, `tiktok-disconnect`, `tiktok-refresh`)
- **Mock mode**: Quando `TIKTOK_CLIENT_ID` não existir, UI funciona com fluxo simulado e badge "Modo Demo"

---

## Ficheiros a Criar

```text
src/components/integrations/TikTokIntegrationCard.tsx   # Card principal com estados
src/components/integrations/ConnectionStatusBadge.tsx    # Badge (conectado/desconectado/erro/expirado)
src/components/integrations/ConnectionLogs.tsx           # Logs simples de conexão
src/components/integrations/ScopesDisplay.tsx            # Permissões concedidas
src/pages/TikTokCallback.tsx                             # Página de callback OAuth
src/hooks/useTikTokIntegration.ts                        # Hook para estado e ações da integração
supabase/functions/tiktok-connect/index.ts               # Gera URL de autorização
supabase/functions/tiktok-callback/index.ts              # Troca code por token
supabase/functions/tiktok-disconnect/index.ts            # Remove integração
supabase/functions/tiktok-refresh/index.ts               # Renova token
```

## Ficheiros a Editar

- `src/pages/Perfil.tsx` — Adicionar sistema de tabs (Perfil | Integrações) com a seção TikTok
- `src/App.tsx` — Adicionar rota `/auth/tiktok/callback` (pública, fora do ProtectedRoute)

---

## UI / Estados do Card TikTok

O `TikTokIntegrationCard` mostra 6 estados:
1. **Desconectado** — botão "Conectar TikTok" com ícone TikTok
2. **Conectando** — spinner + "Redirecionando para TikTok..."
3. **Conectado** — badge verde, username TikTok, escopos, último sync, botões reconectar/desconectar
4. **Erro** — badge vermelho, mensagem de erro, botão tentar novamente
5. **Token expirado** — badge amarelo, aviso, botão reconectar
6. **Modo Demo** — banner informativo indicando que credenciais não estão configuradas, fluxo simulado

## Callback Page (`/auth/tiktok/callback`)

- Lê `code`, `state`, `error` dos query params
- Mostra estados visuais: processando → sucesso → redireciona para `/perfil`
- Em caso de erro: mostra mensagem + botão voltar
- Em modo mock: simula sucesso após 2s

## Hook `useTikTokIntegration`

- Busca status atual (mock ou real via edge function)
- Métodos: `connect()`, `disconnect()`, `refresh()`
- Estado: `status`, `loading`, `error`, `integration`
- Detecta modo mock quando edge function retorna flag `mock: true`

---

## Banco de Dados (Migração)

2 tabelas novas:

**`oauth_integrations`** — tokens e estado da conexão
- `id`, `user_id`, `provider`, `provider_user_id`, `access_token` (encrypted), `refresh_token`, `token_type`, `scopes text[]`, `expires_at`, `connected_at`, `last_synced_at`, `status` (connected/disconnected/expired/error), `raw_payload jsonb`, `created_at`, `updated_at`
- RLS: usuário vê apenas suas próprias integrações

**`oauth_states`** — states temporários para validação CSRF
- `id`, `user_id`, `provider`, `state`, `redirect_to`, `expires_at`, `created_at`
- RLS: usuário vê apenas seus próprios states

---

## Edge Functions (Stubs)

Todas verificam se `TIKTOK_CLIENT_ID` e `TIKTOK_CLIENT_SECRET` existem. Se não, retornam resposta mock.

1. **`tiktok-connect`** (GET) — Gera state, salva em `oauth_states`, retorna URL de autorização TikTok
2. **`tiktok-callback`** (POST) — Valida state, troca code por token, salva em `oauth_integrations`
3. **`tiktok-disconnect`** (POST) — Marca integração como `disconnected`
4. **`tiktok-refresh`** (POST) — Usa refresh_token para renovar access_token

---

## Segurança

- Tokens nunca expostos no frontend — edge functions retornam apenas status/metadata
- State validado obrigatoriamente no callback
- `client_secret` apenas no backend (secrets)
- ENV vars preparadas: `TIKTOK_CLIENT_ID`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`

---

## Ordem de Implementação

1. Migração DB (tabelas `oauth_integrations` + `oauth_states`)
2. Componentes UI (card, badges, logs, scopes)
3. Hook `useTikTokIntegration`
4. Tabs no Perfil + seção Integrações
5. Página callback + rota
6. Edge functions stub

