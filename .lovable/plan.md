

## Plano: Remover preços da Landing Page

### O que será feito

Remover a seção de preços e todas as referências a ela na Landing Page (`/`).

### Mudanças

**Arquivo: `src/pages/LandingPage.tsx`**

1. **Remover o componente `PricingSection`** (linhas 824–975) — deletar a função inteira.

2. **Remover a renderização do `PricingSection`** (linhas ~1204–1206) — remover `<PricingSection checkoutMonthly={...} checkoutLifetime={...} />`.

3. **Remover "Preços" do nav do header** (linha 157) — remover `{ label: "Preços", href: "#pricing" }` do array `navLinks`.

4. **Remover "Preços" do footer** (linha 1110) — remover `{ label: "Preços", href: "#pricing" }` do array do footer.

### Resultado

A landing page não exibirá mais valores, planos ou links de checkout. As seções restantes (Hero, Proof, Tour, FAQ, etc.) permanecem intactas.

