

## Plano: Sistema de Paginas de Afiliados

### Como funciona

Cada afiliado tera uma URL unica como `viralizeia.com/julio` ou `viralizeia.com/maria`. Essa pagina mostra a mesma landing page, mas com os links de checkout personalizados do afiliado. Quem acessar sem slug de afiliado (so `viralizeia.com`) ve a pagina padrao com seus links originais.

### Arquitetura

1. **Tabela no banco de dados** para cadastrar afiliados com:
   - `slug` (ex: "julio") - identificador unico na URL
   - `name` (nome do afiliado)
   - `checkout_monthly` (link de checkout mensal do afiliado)
   - `checkout_lifetime` (link de checkout vitalicio do afiliado)
   - `active` (para desativar se necessario)

2. **Rota dinamica** no React Router: `/:affiliateSlug` que carrega a mesma LandingPage, mas busca os dados do afiliado no banco e substitui os links de checkout.

3. **Logica na LandingPage**: O componente recebe opcionalmente os links do afiliado via parametro de rota. Se existir um slug valido, usa os links do afiliado. Se nao, usa os links padrao (PerfectPay/CenterPag atuais).

### Detalhes Tecnicos

**1. Criar tabela `affiliates`**
```sql
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  checkout_monthly TEXT NOT NULL,
  checkout_lifetime TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Permitir leitura publica (landing page nao exige login)
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active affiliates"
  ON public.affiliates FOR SELECT
  USING (active = true);
```

**2. Nova rota no App.tsx**
```
<Route path="/:affiliateSlug" element={<LandingPage />} />
```
Essa rota precisa ficar antes do `*` (NotFound) e depois das rotas fixas.

**3. Modificar LandingPage.tsx**
- Usar `useParams()` para capturar o `affiliateSlug`
- Se houver slug, buscar o afiliado no banco via Supabase
- Se o afiliado existir e estiver ativo, usar seus links de checkout
- Se nao existir, redirecionar para `/` (pagina padrao)
- Os links padrao atuais (PerfectPay/CenterPag) continuam como fallback

**4. Cadastro de afiliados**
Para adicionar afiliados, voce podera:
- Inserir direto pelo painel do backend (Lovable Cloud)
- Ou podemos criar uma tela admin futuramente

### Exemplo de uso

| Afiliado | URL | Link Mensal | Link Vitalicio |
|----------|-----|-------------|----------------|
| Julio | viralizeia.com/julio | link-do-julio-mensal | link-do-julio-vitalicio |
| Maria | viralizeia.com/maria | link-da-maria-mensal | link-da-maria-vitalicio |
| (padrao) | viralizeia.com | PPU38CQ4E1A | PPU38CQ6M3E |

### Ordem de implementacao

1. Criar a tabela `affiliates` no banco
2. Adicionar a rota dinamica no App.tsx
3. Atualizar LandingPage.tsx para ler o slug e buscar links do afiliado
4. Testar com um afiliado de exemplo

