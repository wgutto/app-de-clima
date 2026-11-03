# Tarefas de implementação — Aplicativo de Clima

Este arquivo divide a implementação do [PRD](./prd.md) em tarefas progressivas. Cada tarefa deve ser executada por um agente por vez, na ordem apresentada, salvo quando uma dependência indicar o contrário.

As regras e decisões de produto permanecem no [PRD](./prd.md). Este documento descreve apenas o trabalho a executar e como aprová-lo.

## Como usar

- Execute uma tarefa por vez.
- Marque `[x]` somente depois de cumprir todos os critérios de aprovação da tarefa.
- O agente responsável deve validar a tarefa sem alterar o escopo das tarefas seguintes.
- Testes e comandos de validação devem ser registrados na descrição da alteração ou no relatório do agente.
- Uma tarefa bloqueada não deve ser marcada como concluída; registre o motivo e a decisão necessária.

## Fases de implementação

As fases abaixo organizam as tarefas por dependência técnica. Dentro de cada fase, execute as tarefas na ordem indicada e só avance quando os critérios de aprovação da tarefa anterior forem atendidos.

### Fase 1 — Fundação do projeto

**Objetivo:** garantir que o projeto Vite, TypeScript e Vanilla DOM esteja instalável, compilável e executável.

**Tarefas, na ordem recomendada:**

1. Tarefa 1 — Preparar a fundação do projeto.

**Gate da fase:** build de produção, verificação TypeScript e servidor de desenvolvimento funcionando.

### Fase 2 — Domínio e integração de dados

**Objetivo:** criar os contratos internos, integrar a Open-Meteo e preparar as transformações de dados.

**Tarefas, na ordem recomendada:**

1. Tarefa 2 — Definir modelos internos e estados da aplicação.
2. Tarefa 3 — Implementar a integração de geocodificação.
3. Tarefa 4 — Implementar a integração do clima atual.
4. Tarefa 5 — Criar o mapeamento de Weather Code.
5. Tarefa 6 — Implementar normalização e formatação dos dados.

**Gate da fase:** modelos tipados, integrações isoladas e dados prontos para consumo pela interface.

### Fase 3 — Estrutura e interação inicial da interface

**Objetivo:** construir a estrutura semântica e permitir a entrada de pesquisa com empty state.

**Tarefas, na ordem recomendada:**

1. Tarefa 7 — Construir a estrutura semântica da página.
2. Tarefa 8 — Implementar a busca e o empty state.

**Gate da fase:** formulário acessível, busca por botão/Enter e estado inicial funcionando sem dados reais.

### Fase 4 — Fluxo de consulta e apresentação dos dados

**Objetivo:** conectar a interface às integrações e exibir sucesso, loading e erros.

**Tarefas, na ordem recomendada:**

1. Tarefa 9 — Implementar o fluxo completo de consulta.
2. Tarefa 10 — Renderizar o resumo climático.
3. Tarefa 11 — Renderizar os detalhes meteorológicos.
4. Tarefa 12 — Implementar loading, erros e tentativa novamente.

**Gate da fase:** jornada completa de busca funcionando, com estados e dados meteorológicos renderizados corretamente.

### Fase 5 — Design, qualidade e entrega

**Objetivo:** finalizar responsividade, acessibilidade, testes e validação do MVP.

**Tarefas, na ordem recomendada:**

1. Tarefa 13 — Aplicar o design visual e responsivo.
2. Tarefa 14 — Completar a acessibilidade e compatibilidade.
3. Tarefa 15 — Adicionar os testes essenciais.
4. Tarefa 16 — Executar validação final e fechar o MVP.

**Gate da fase:** todos os critérios de aceite do PRD atendidos e definição de pronto validada.

## Tarefas detalhadas

### 1. [x] Preparar a fundação do projeto

**Referências:** [Stack e compatibilidade](./prd.md#stack), [RNF03 — Compatibilidade](./prd.md#rnf03--compatibilidade), [Definição de pronto](./prd.md#12-definição-de-pronto).

Configure ou valide a base Vite + TypeScript + Vanilla DOM, incluindo scripts de desenvolvimento, build e verificação de tipos. Preserve a estrutura existente do projeto e não adicione dependências sem necessidade.

**Critérios de aprovação:**

- `npm install` ou o gerenciador já adotado pelo projeto conclui sem erro.
- O comando de desenvolvimento inicia a aplicação.
- O build de produção conclui sem erro.
- A verificação de tipos, quando configurada, não apresenta erros.
- A aplicação abre em um navegador moderno com uma página inicial válida.

### 2. [x] Definir modelos internos e estados da aplicação

**Referências:** [Modelo interno sugerido](./prd.md#modelo-interno-sugerido), [RF08 — Estados da interface](./prd.md#rf08--estados-da-interface), [Fluxo técnico da busca](./prd.md#fluxo-técnico-da-busca).

Crie os tipos para localização, clima atual, unidades, estado da tela e erros controlados. Os modelos internos devem usar nomes independentes dos nomes da Open-Meteo.

**Critérios de aprovação:**

- Os tipos representam todos os campos obrigatórios do PRD.
- `weatherCode`, `isDay`, temperatura, umidade, precipitação e vento possuem tipos apropriados.
- Os estados inicial, loading, sucesso, cidade não encontrada, erro e entrada inválida são representados explicitamente.
- O projeto continua compilando sem uso de `any` para contornar os tipos.

### 3. [x] Implementar a integração de geocodificação

**Referências:** [RF03 — Resolver localização](./prd.md#rf03--resolver-localização), [Camada de integração](./prd.md#camada-de-integração), [RNF04 — Confiabilidade](./prd.md#rnf04--confiabilidade).

Implemente a função responsável por consultar o endpoint de geocodificação. Ela deve construir a URL, codificar o nome da cidade, validar parâmetros, tratar status HTTP e transformar o primeiro resultado válido em `Location`.

**Critérios de aprovação:**

- A função consulta o endpoint com `count=1`, `language=pt` e `format=json`.
- O nome da cidade é codificado corretamente na URL.
- Entrada vazia ou inválida não gera uma requisição incompleta.
- Resultado sem itens retorna uma condição explícita de cidade não encontrada.
- Resposta HTTP malsucedida ou payload inválido gera erro controlado.
- Nenhum componente de UI chama `fetch` diretamente.

### 4. [x] Implementar a integração do clima atual

**Referências:** [RF04 — Consultar clima atual](./prd.md#rf04--consultar-clima-atual), [Camada de integração](./prd.md#camada-de-integração), [RNF05 — Segurança e privacidade](./prd.md#rnf05--segurança-e-privacidade).

Implemente a função que consulta o forecast usando latitude, longitude e timezone. Valide os parâmetros, solicite todos os campos definidos no PRD e transforme `current` e `current_units` no modelo interno.

**Critérios de aprovação:**

- A URL contém latitude, longitude e timezone codificados.
- O parâmetro `current` contém todos os campos obrigatórios do PRD.
- A função valida latitude, longitude e timezone antes da requisição.
- Status HTTP inválido e resposta sem `current` ou campos obrigatórios geram erro explícito.
- As unidades retornadas por `current_units` são preservadas no modelo interno.
- A integração do clima está isolada da camada de apresentação.

### 5. [x] Criar o mapeamento de Weather Code

**Referências:** [RF07 — Interpretar Weather Code](./prd.md#rf07--interpretar-weather-code), [Testes unitários](./prd.md#testes-unitários).

Crie um módulo de domínio que converta todos os grupos de códigos WMO listados no PRD em descrição em português e ícone. Inclua fallback para códigos desconhecidos.

**Critérios de aprovação:**

- Todos os grupos `0`, `1–3`, `45/48`, `51–57`, `61–67`, `71–77`, `80–86` e `95–99` são cobertos.
- Cada código retorna uma descrição em português e uma referência de ícone.
- Código desconhecido retorna “Condição não identificada” ou equivalente definido pela UI.
- A função é pura e não depende do DOM ou da rede.
- Existem testes unitários para cada grupo e para o fallback.

### 6. [x] Implementar normalização e formatação dos dados

**Referências:** [RF05 — Exibir localização e resumo](./prd.md#rf05--exibir-localização-e-resumo), [RF06 — Exibir detalhes meteorológicos](./prd.md#rf06--exibir-detalhes-meteorológicos), [RNF01 — Responsividade](./prd.md#rnf01--responsividade).

Implemente helpers para normalizar a busca, formatar temperatura, percentuais, vento e data/hora local. A data deve usar o timezone retornado pela localização e o valor `current.time`.

**Critérios de aprovação:**

- Espaços iniciais e finais são removidos do termo de pesquisa.
- Entrada vazia é identificada antes da chamada à API.
- Valores exibem as unidades corretas, preferencialmente vindas de `current_units`.
- Data e hora são formatadas em pt-BR usando o timezone da cidade, não o timezone do navegador.
- Valores válidos são formatados sem `NaN`, `undefined` ou unidades duplicadas.
- Casos de borda relevantes possuem testes unitários.

### 7. [x] Construir a estrutura semântica da página

**Referências:** [Composição](./prd.md#composição), [Sidebar](./prd.md#sidebar), [Área principal](./prd.md#área-principal), [RNF02 — Acessibilidade](./prd.md#rnf02--acessibilidade).

Crie o HTML/DOM base para a área de busca, painel de resultados, sidebar, área de detalhes e regiões de mensagens. Use landmarks e elementos semânticos desde o início.

**Critérios de aprovação:**

- Existe formulário com `label` associado ao campo de cidade.
- O botão de busca possui nome acessível.
- O painel contém uma região lateral para resumo e uma região principal para detalhes.
- As regiões de loading e mensagens possuem local semântico para atualização acessível.
- A estrutura não depende de texto visual como único mecanismo de identificação.

### 8. [x] Implementar a busca e o empty state

**Referências:** [RF01 — Pesquisar cidade](./prd.md#rf01--pesquisar-cidade), [RF02 — Iniciar busca](./prd.md#rf02--iniciar-busca), [Empty state](./prd.md#rf08--estados-da-interface).

Conecte o formulário ao estado inicial e implemente a submissão por botão e Enter. A busca deve normalizar o texto, impedir vazio e preparar o estado loading.

**Critérios de aprovação:**

- Ao abrir a aplicação, o empty state orienta a pesquisa de uma cidade.
- O botão inicia a busca com um termo válido.
- Enter no campo inicia a mesma busca.
- Termo vazio não chama nenhuma API e exibe mensagem próxima ao campo.
- A submissão duplicada é bloqueada durante loading.

### 9. [ ] Implementar o fluxo completo de consulta

**Referências:** [Jornada principal](./prd.md#jornada-principal), [Fluxo técnico da busca](./prd.md#fluxo-técnico-da-busca), [RF08 — Estados da interface](./prd.md#rf08--estados-da-interface).

Orquestre a geocodificação e a consulta de clima em uma única ação de usuário. Conecte as funções de integração aos estados da interface e limpe resultados antigos quando uma nova busca falhar.

**Critérios de aprovação:**

- Uma busca válida chama geocodificação e, somente após localização válida, chama clima.
- O loading permanece ativo durante as duas requisições.
- Cidade não encontrada renderiza exclusivamente o estado `not-found`.
- Erro de rede, HTTP ou payload renderiza exclusivamente o estado `error`.
- Uma nova busca malsucedida não deixa dados anteriores aparentando ser o resultado atual.
- Uma busca bem-sucedida renderiza o estado `success` com os dados transformados.

### 10. [ ] Renderizar o resumo climático

**Referências:** [RF05 — Exibir localização e resumo](./prd.md#rf05--exibir-localização-e-resumo), [Sidebar](./prd.md#sidebar).

Renderize na sidebar a temperatura, cidade, código do país, data/hora local, período do dia, ícone e descrição do Weather Code.

**Critérios de aprovação:**

- O nome da cidade e o código do país aparecem no resultado.
- A temperatura atual aparece com unidade.
- A data/hora corresponde ao timezone da cidade.
- `is_day` produz indicação textual de dia ou noite.
- O Weather Code exibe ícone e descrição textual em português.
- Dados ausentes não geram conteúdo quebrado ou exceções no DOM.

### 11. [ ] Renderizar os detalhes meteorológicos

**Referências:** [RF06 — Exibir detalhes meteorológicos](./prd.md#rf06--exibir-detalhes-meteorológicos), [Área principal](./prd.md#área-principal).

Renderize na área principal a umidade relativa, sensação térmica, probabilidade de precipitação, velocidade e direção do vento.

**Critérios de aprovação:**

- Todos os cinco detalhes aparecem após uma busca bem-sucedida.
- Cada valor tem rótulo compreensível e unidade.
- A direção do vento é exibida em graus e pode incluir direção cardeal.
- A sensação térmica é distinguida visualmente da temperatura atual.
- A área não exibe placeholders de sucesso quando o estado não é `success`.

### 12. [ ] Implementar loading, erros e tentativa novamente

**Referências:** [RF08 — Estados da interface](./prd.md#rf08--estados-da-interface), [RNF04 — Confiabilidade](./prd.md#rnf04--confiabilidade), [Busca](./prd.md#busca).

Finalize o feedback de operação para loading, cidade não encontrada, falha da API e entrada inválida. Inclua uma ação clara para tentar novamente sem introduzir cache ou atualização automática.

**Critérios de aprovação:**

- O loading possui mensagem visível e estado acessível.
- O controle de busca indica quando está desabilitado.
- Cidade inexistente possui mensagem específica e permite nova pesquisa.
- Falha de clima/rede possui mensagem de erro e ação de nova tentativa.
- Mensagens são anunciadas por região `aria-live` adequada.
- Não existe atualização automática nem cache no comportamento implementado.

### 13. [ ] Aplicar o design visual e responsivo

**Referências:** [Instruções visuais e UX](./prd.md#8-instruções-visuais-e-ux), [RNF01 — Responsividade](./prd.md#rnf01--responsividade).

Aplique o fundo cinza escuro, painel branco centralizado com largura máxima de 800px, bordas arredondadas, composição sidebar/conteúdo e adaptação para mobile.

**Critérios de aprovação:**

- Em desktop, a sidebar fica à esquerda e os detalhes à direita dentro do painel.
- O painel tem fundo branco, bordas arredondadas e largura máxima de 800px.
- A área superior de busca não possui o background do painel de resultados.
- Em mobile, sidebar e detalhes ficam empilhados sem rolagem horizontal.
- O campo de busca, painel e cards de detalhes preservam margens e espaçamento legíveis.
- Foco, contraste e estados não dependem apenas de cor.

### 14. [ ] Completar a acessibilidade e compatibilidade

**Referências:** [RNF02 — Acessibilidade](./prd.md#rnf02--acessibilidade), [RNF03 — Compatibilidade](./prd.md#rnf03--compatibilidade).

Faça uma revisão específica de teclado, foco, semântica, textos alternativos, anúncios de estado e contraste em navegadores modernos.

**Critérios de aprovação:**

- Todo o fluxo, da busca ao erro e sucesso, funciona somente com teclado.
- O foco permanece visível em campo, botão e ações de erro.
- Ícones informativos possuem alternativa textual; ícones decorativos são ignorados por tecnologias assistivas.
- Labels, headings e landmarks formam uma estrutura coerente.
- Loading e erros são comunicados sem depender apenas de mudança visual.
- A interface não apresenta rolagem horizontal na viewport mobile validada.

### 15. [ ] Adicionar os testes essenciais

**Referências:** [Testes essenciais](./prd.md#10-testes-essenciais), [Critérios de aceite](./prd.md#9-criterios-de-aceite).

Adicione testes unitários para domínio e integração, além de testes de comportamento para o fluxo principal e estados da UI, usando o framework já adotado ou configurado no projeto.

**Critérios de aprovação:**

- Há testes para normalização, validação, URLs e payloads.
- Há testes para todos os grupos de Weather Code e código desconhecido.
- Há teste para timezone e formatação pt-BR.
- Há testes para sucesso, cidade não encontrada, erro de clima e payload inválido.
- Há testes para Enter, botão, loading e bloqueio de submissão duplicada.
- O comando de testes configurado passa sem falhas.

### 16. [ ] Executar validação final e fechar o MVP

**Referências:** [Critérios de aceite](./prd.md#9-criterios-de-aceite), [Métricas e observabilidade](./prd.md#11-métricas-e-observabilidade-do-mvp), [Definição de pronto](./prd.md#12-definição-de-pronto).

Faça a validação integrada da aplicação em uma viewport desktop e uma viewport mobile. Corrija somente problemas relacionados ao PRD e registre o resultado dos comandos de build, tipos e testes.

**Critérios de aprovação:**

- Todos os critérios de aceite do PRD estão atendidos.
- Build, verificação de tipos e testes passam.
- O fluxo completo foi validado em uma viewport desktop e uma mobile.
- Não há chamadas diretas à Open-Meteo fora da camada de integração.
- Não há erros de console causados pelo fluxo principal.
- O empty state, loading, sucesso, cidade não encontrada e erro podem ser reproduzidos e conferidos.
