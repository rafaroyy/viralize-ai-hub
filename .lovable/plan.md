

# Plano: Corrigir visibilidade dos dados do Radar

## Problema
A edge function `radar-youtube-fetch` processou 50 vídeos com sucesso (confirmado no banco). Porém, as queries do frontend retornam `[]` porque:
- As tabelas `trends` e `trend_sources` têm RLS policy apenas para role `authenticated`
- O app usa autenticação externa (api.viralizeia.com), então o Supabase client opera com o token `anon`
- O role `anon` não tem permissão de SELECT nessas tabelas

## Solução
Criar uma migration que adicione políticas de leitura para o role `anon` nas tabelas:
- `trends` — permitir SELECT para `anon`
- `trend_sources` — permitir SELECT para `anon`

```sql
CREATE POLICY "Anon read trends" ON public.trends FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read trend_sources" ON public.trend_sources FOR SELECT TO anon USING (true);
```

## Impacto
- Apenas 1 migration SQL, zero mudanças no frontend
- Os dados já existentes aparecerão imediatamente após aplicar a policy

