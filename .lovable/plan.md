

# Nova Pagina de Vendas em /pagina

## Resumo
Criar uma nova pagina de vendas na rota `/pagina` com a copy agressiva fornecida, mantendo o design system existente (dark tech, neon roxo, glass-card, framer-motion). Nenhuma alteracao no backend ou em outras paginas.

## Estrutura das Secoes

1. **Hero** - "Todos os dias alguem desconhecido fica rico com videos simples." + CTA "Quero comecar agora" + microcopy "Pagamento unico. Acesso vitalicio."
2. **Dor + Inveja** - "Enquanto voce assiste, outros estao faturando." + frases curtas isoladas
3. **Virada Mental** - "O jogo nao e sobre trabalhar. E sobre aparecer." + "Voce nao precisa de outro produto. Precisa de visualizacoes."
4. **Solucao (Viralize)** - "A ferramenta criada para fabricar videos virais." + lista com X (sem criatividade, sem experiencia, sem audiencia)
5. **Prova (Comparacao)** - "A diferenca e brutal." + 2 colunas (Sem Viralize vs Com Viralize)
6. **Oferta** - Acesso vitalicio, De R$645 por R$247, CTA repetido, frase de ancoragem
7. **Fechamento** - "Daqui a 1 ano, voce vai desejar ter comecado hoje."

## Detalhes Tecnicos

### Arquivos criados
- `src/pages/PaginaVendas.tsx` - Nova pagina completa com todas as 7 secoes

### Arquivos modificados
- `src/App.tsx` - Adicionar rota `/pagina` apontando para `PaginaVendas`

### Componentes reutilizados
- `ScrollReveal` (mesmo pattern da LandingPage)
- `framer-motion` para animacoes
- Classes utilitarias existentes: `glass-card`, `gradient-primary`, `shadow-glow`, `font-display`
- Logo existente no header
- Icones do `lucide-react` (ArrowRight, X, TrendingDown, TrendingUp, Shield)

### Regras de UI seguidas conforme o prompt
- Maximo 1 ideia por bloco
- Frases de impacto em linha isolada (texto maior, peso bold)
- Sem emojis no site
- CTAs apenas no Hero + Oferta
- Visual clean, contraste alto, bastante espaco
- Navbar simplificada (logo + "Entrar" + CTA)
- Footer minimalista

### Pricing
- Preco: De R$645 por R$247
- Pagamento unico
- Link de checkout vitalicio reutilizado (CenterPag)
- Suporte a affiliate slug mantido

### Rota
- `/pagina` como rota publica (nao protegida)
- A rota `/:affiliateSlug` continua funcionando para a LandingPage original em `/`

