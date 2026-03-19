

## Plano: Aba "Parceiro Oficial" no Perfil (exclusiva para contas específicas)

### Resumo

Adicionar uma nova aba **"Parceiro"** na página de Perfil, visível apenas para os emails `juliocrepaldi200@gmail.com` e `rafa07roy@gmail.com`. Essa aba permitirá gerar e compartilhar links de convite com preço especial para novos membros.

### O que será feito

1. **Aba condicional no Perfil** (`src/pages/Perfil.tsx`)
   - Verificar `user?.email` contra a lista de parceiros autorizados
   - Se for parceiro, renderizar a aba extra "Parceiro" com ícone de coroa/estrela
   - A aba aparece entre "Criador" e "Integrações"

2. **Conteúdo da aba "Parceiro Oficial"** (novo componente `src/components/profile/PartnerTab.tsx`)
   - Header com badge "Parceiro Oficial Viralize"
   - Seção de link de convite: gera um link único baseado no slug do parceiro na tabela `affiliates` (já existente no banco)
   - Botão "Copiar Link" para copiar o link de convite
   - Explicação de que convidados por esse link terão acesso a preço especial
   - Estatísticas simples (se houver dados futuros)

3. **Integração com a tabela `affiliates`**
   - Buscar o registro do parceiro pelo email do usuário logado
   - Usar o `slug` para montar o link de convite: `https://viralizeia.com/{slug}`
   - Se o parceiro ainda não tiver um registro na tabela, exibir estado vazio com instrução

### Detalhes técnicos

- Lista de emails autorizados como constante no componente (sem banco, sem RLS — é só uma verificação client-side para exibição da aba)
- A tabela `affiliates` já existe e tem os campos `slug`, `checkout_monthly`, `checkout_lifetime`, `name`, `active`
- Será necessário adicionar o campo `email` à tabela `affiliates` (via migration) para vincular o parceiro ao usuário logado, ou buscar pelo `name`/outro campo

### Arquivos modificados
- `src/pages/Perfil.tsx` — adicionar aba condicional
- `src/components/profile/PartnerTab.tsx` — novo componente com conteúdo da aba

### Migration necessária
- Adicionar coluna `email` na tabela `affiliates` para vincular parceiro ao usuário logado

