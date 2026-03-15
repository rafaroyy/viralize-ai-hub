

# Integrar Catalog Hub (Affiliate Hub) na Viralize

## Resumo

O projeto [Catalog Hub](/projects/7727210d-f6c3-404c-b0eb-9b0889770315) é simples: uma única página com 5 cards de marketplaces de afiliação (TikTok Shop, Kiwify, Hotmart, Monetizze, Cakto). Vou trazê-lo como uma nova aba na sidebar da Viralize.

## O que será feito

### 1. Criar página `src/pages/AffiliateHub.tsx`
- Copiar o conteúdo do `Index.tsx` do Catalog Hub (hero + grid de cards)
- Remover header e footer standalone (já temos a sidebar do AppLayout)
- Manter os dados dos 5 catálogos, animações framer-motion e design dos cards

### 2. Adicionar rota protegida no `src/App.tsx`
- Nova rota `/affiliate-hub` → `AffiliateHub` dentro do bloco `<ProtectedRoute />`

### 3. Adicionar link na sidebar `src/components/AppSidebar.tsx`
- Novo item "Affiliate Hub" com ícone `Store` do Lucide, apontando para `/affiliate-hub`

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `src/pages/AffiliateHub.tsx` |
| Editar | `src/App.tsx` (1 import + 1 rota) |
| Editar | `src/components/AppSidebar.tsx` (1 link na nav) |

