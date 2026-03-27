

## Plano: Popup "Novidades da Semana" pós-login

### O que será feito

Modal automático após login com conteúdo viral da semana (memes, músicas, trends), gerado por IA e cacheado no banco.

### Arquitetura

```text
Login → AppLayout → useEffect detecta login
                       ↓
         Verifica localStorage "weekly_digest_seen_{semana}"
                       ↓ (não visto)
         Chama Edge Function "weekly-digest"
                       ↓
         Verifica cache na tabela weekly_digest
                       ↓
         Cache válido → retorna | Senão → Gemini 2.5 Pro → salva → retorna
                       ↓
         Exibe Dialog com conteúdo por categoria
```

### Banco de dados

Nova tabela `weekly_digest`:

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | auto |
| week_key | text unique | Ex: "2026-W13" |
| content | jsonb | Memes, músicas, trends |
| created_at | timestamptz | auto |

RLS: SELECT para authenticated. INSERT via service_role (edge function).

### Edge Function: `weekly-digest`

- Calcula `week_key` atual
- Verifica cache na tabela
- Se não existe, chama **google/gemini-2.5-pro** (modelo mais forte, melhor qualidade de resposta) via Lovable AI Gateway com prompt pedindo novidades virais da semana no Brasil
- Salva e retorna JSON estruturado:

```json
{
  "week": "2026-W13",
  "sections": [
    { "title": "🔥 Memes que Viralizaram", "items": [{ "title": "...", "description": "...", "platform": "tiktok" }] },
    { "title": "🎵 Músicas em Alta", "items": [...] },
    { "title": "📈 Trends da Semana", "items": [...] },
    { "title": "💡 Oportunidades de Conteúdo", "items": [...] }
  ]
}
```

### Componente: `WeeklyDigestModal`

- Dialog com seções e cards por item
- Loading com `AiLoader hideText`
- Botão "Entendi, vamos criar!" fecha e marca localStorage
- Controle: `weekly_digest_seen_2026-W13`

### Arquivos

| Arquivo | Ação |
|---|---|
| Migração SQL | Criar tabela `weekly_digest` |
| `supabase/functions/weekly-digest/index.ts` | Criar — usa **google/gemini-2.5-pro** via Lovable AI Gateway |
| `src/components/WeeklyDigestModal.tsx` | Criar componente do modal |
| `src/components/AppLayout.tsx` | Renderizar `WeeklyDigestModal` |

