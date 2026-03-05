

# Transformar /pagina em Convite Exclusivo Pós-Live (Vitalício)

## Resumo
Reescrever `src/pages/PaginaVendas.tsx` para ser uma página de convite exclusivo para leads vindos de uma live, vendendo apenas o Plano Vitalício. Nenhum outro arquivo será alterado.

## Estrutura Final (7 seções obrigatórias)

### 1. HERO
- Microcopy no topo: "Este acesso foi liberado para você após a live."
- Headline: "Seu convite exclusivo para o acesso vitalício à Viralize"
- Subheadline: curta, reforçando condição limitada
- CTA primário: "Garantir meu acesso vitalício" → link CHECKOUT_LIFETIME

### 2. PROVAS (ANTES/DEPOIS)
- Mover seção ProvaSection para posição 2 (logo após hero)
- Título: "O que muda na prática"
- Manter imagens `semViralizeImg` e `comViralizeImg` intactas, mesmo formato, mesmas classes
- Bullets e cards iguais

### 3. COMO FUNCIONA (3 passos)
- Substituir seções Dor + Virada + Solução por uma única seção "Como funciona"
- 3 passos simples: Escolha o objetivo → Viralize gera a estrutura → Você posta com consistência
- Visual com cards numerados

### 4. BENEFÍCIOS
- Nova seção com bullets diretos
- Foco: velocidade, consistência, direção criativa, menos tentativa e erro, mais iteração
- Layout clean com ícones Check

### 5. VITALÍCIO (o que inclui)
- Reescrever OfertaSection: remover tabs mensal/lifetime, remover `CHECKOUT_MONTHLY`
- Card único: Vitalício
- Preço: De R$697 riscado → R$645
- Lista de features mantida
- Timer de escassez mantido
- CTA: "Garantir acesso vitalício"
- Reforço: pagamento único, acesso contínuo, sem mensalidade

### 6. FAQ
- Nova seção com 5-6 perguntas (sem mencionar plano mensal)
- Perguntas: O que é a Viralize? / Como funciona o acesso vitalício? / Tem garantia? / Preciso de experiência? / Como acesso após a compra? / Posso usar em qualquer nicho?

### 7. OFERTA FINAL (hard close)
- Reescrever FechamentoSection
- Repetir oferta: valor riscado + valor atual
- CTA forte: "Ativar acesso vitalício agora"

### Navbar
- CTA do navbar: "Garantir acesso" (link vitalício)
- Remover referência a CHECKOUT_MONTHLY

### Footer
- Sem alterações

## Arquivo modificado
- `src/pages/PaginaVendas.tsx` — reescrita completa do conteúdo, mantendo helpers (ScrollReveal, SectionTag, ImpactLine), imports, e assets

## Checklist
- Apenas `/pagina` alterada
- Imagens de prova intactas
- Zero menção a plano mensal
- Topo menciona live
- CTA no hero + CTA no final
- Nenhum arquivo externo tocado

