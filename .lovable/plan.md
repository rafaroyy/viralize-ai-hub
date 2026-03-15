

## Problem

The pricing card shows "25,19" as a giant number with "12x de R$" as small muted text above/beside it — making it look like the price is just "25,19" without context. The "12x de" part needs to be visually prominent and connected to the value.

## Fix

Restructure the price display so "12x de" is clearly visible above the main price, and "R$ 25,19" reads as a single cohesive unit:

```
12x de
R$ 25,19
ou R$245 à vista
```

Changes in `src/pages/PaginaVendas.tsx` lines 503-508:
- Stack vertically: "12x de" on its own line in a visible size (`text-base text-foreground/70`)
- Main price line: "R$" + "25,19" together at large size
- Keep "ou R$245 à vista" below

This is a text-only change to the existing flex structure — no layout/design changes.

