# PRD — Aplicativo de Clima

## 1. Visão geral

O aplicativo permite que uma pessoa pesquise uma cidade e consulte suas condições climáticas atuais. A experiência deve ser simples: o usuário informa o nome da cidade, aguarda uma única operação de busca e visualiza localização, temperatura, condição do tempo, umidade, sensação térmica, precipitação e vento.

O MVP será uma aplicação web desenvolvida com Vite, Vanilla JavaScript e TypeScript, utilizando a Open-Meteo como fonte de geocodificação e dados meteorológicos.

## 2. Objetivos

- Permitir a pesquisa de uma cidade pelo nome.
- Exibir dados climáticos atuais de forma clara e legível.
- Informar a localização encontrada, incluindo país e horário local.
- Representar o `weather_code` com descrição em português e ícone apropriado.
- Manter a integração com a Open-Meteo isolada em funções próprias, facilitando uma futura troca de provedor.
- Oferecer uma experiência responsiva, acessível e compreensível em estados de carregamento, vazio e erro.

## 3. Escopo do MVP

### Incluído

- Campo de pesquisa de cidade.
- Busca acionada por botão ou pela tecla Enter.
- Geocodificação da cidade.
- Consulta do clima atual da localização encontrada.
- Exibição das informações climáticas especificadas neste documento.
- Loading único durante as duas requisições.
- Empty state inicial.
- Estados distintos para cidade não encontrada e falha na consulta.
- Layout responsivo para desktop e mobile.
- Interface em português do Brasil.
- Temperatura em graus Celsius e velocidade do vento em quilômetros por hora.
- Data e hora baseadas no timezone retornado para a cidade.
- Requisitos essenciais de acessibilidade.

### Fora do escopo

- Previsão para os próximos dias ou horas.
- Histórico climático.
- Favoritos e persistência de cidades.
- Autolocalização por GPS.
- Atualização automática dos dados.
- Cache de resultados.
- Alternância de unidade de medida.
- Autenticação ou backend próprio.

## 4. Personas e cenário principal

### Persona

Pessoa que deseja consultar rapidamente o clima atual de uma cidade, sem precisar interpretar dados técnicos da API.

### Jornada principal

1. A pessoa acessa a aplicação e vê o campo de busca.
2. Digita o nome de uma cidade.
3. Pressiona Enter ou seleciona o botão de busca.
4. A aplicação exibe um loading enquanto resolve a cidade e consulta o clima.
5. A aplicação apresenta o clima atual da cidade encontrada.
6. A pessoa pode realizar uma nova busca manualmente.

## 5. Requisitos funcionais

### RF01 — Pesquisar cidade

O sistema deve aceitar o nome de uma cidade em um campo de texto. Espaços no início e no fim devem ser removidos antes da consulta.

O campo não deve permitir o envio de uma busca vazia. A interface deve informar que uma cidade precisa ser preenchida.

### RF02 — Iniciar busca

A busca deve ser iniciada:

- pelo botão de busca; ou
- pela tecla Enter enquanto o campo estiver focado.

Durante o loading, o controle de busca deve indicar que a operação está em andamento e evitar submissões duplicadas.

### RF03 — Resolver localização

O sistema deve consultar o endpoint de geocodificação:

```text
GET https://geocoding-api.open-meteo.com/v1/search
  ?name={NOME_DA_CIDADE}
  &count=1
  &language=pt
  &format=json
```

Devem ser utilizados, no mínimo, os seguintes campos do primeiro resultado:

- `name`
- `latitude`
- `longitude`
- `country_code`
- `timezone`

O MVP utiliza o primeiro resultado retornado (`count=1`). Se não houver resultados válidos, o sistema deve exibir o estado de cidade não encontrada.

### RF04 — Consultar clima atual

Após resolver a localização, o sistema deve consultar:

```text
GET https://api.open-meteo.com/v1/forecast
  ?latitude={LATITUDE}
  &longitude={LONGITUDE}
  &current=precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_direction_10m,wind_speed_10m
  &timezone={TIMEZONE}
```

Os campos obrigatórios da resposta são:

- `temperature_2m`
- `relative_humidity_2m`
- `apparent_temperature`
- `is_day`
- `wind_speed_10m`
- `wind_direction_10m`
- `precipitation_probability`
- `weather_code`

O campo `precipitation` pode ser recebido e mantido no modelo interno para compatibilidade com a resposta da API, mas não é obrigatório na composição visual do MVP.

### RF05 — Exibir localização e resumo

A área lateral deve exibir:

- temperatura atual;
- nome da cidade;
- código do país;
- dia e horário local da consulta;
- indicação de dia ou noite, derivada de `is_day`;
- ícone e descrição textual do `weather_code`.

O dia e o horário devem ser interpretados no timezone retornado pela geocodificação e apresentados em formato pt-BR. O horário deve corresponder ao campo `current.time` da resposta meteorológica.

### RF06 — Exibir detalhes meteorológicos

A área principal deve exibir:

- umidade relativa;
- temperatura aparente;
- probabilidade de precipitação;
- velocidade do vento;
- direção do vento.

As unidades devem ser obtidas de `current_units` sempre que possível. O padrão visual esperado é:

- temperatura: `°C`;
- umidade e probabilidade: `%`;
- vento: `km/h`;
- direção: graus (`°`) e, opcionalmente, uma direção cardeal calculada.

### RF07 — Interpretar Weather Code

O sistema deve mapear os códigos WMO para uma descrição em português e um ícone. O mapeamento deve contemplar:

| Código | Descrição |
|---|---|
| 0 | Céu limpo |
| 1, 2, 3 | Principalmente limpo, parcialmente nublado e nublado |
| 45, 48 | Neblina |
| 51, 53, 55 | Chuvisco fraco, moderado e intenso |
| 56, 57 | Chuvisco congelante |
| 61, 63, 65 | Chuva fraca, moderada e intensa |
| 66, 67 | Chuva congelante |
| 71, 73, 75 | Neve fraca, moderada e intensa |
| 77 | Grãos de neve |
| 80, 81, 82 | Pancadas de chuva fracas, moderadas e violentas |
| 85, 86 | Pancadas de neve |
| 95 | Trovoada fraca ou moderada |
| 96, 99 | Trovoada com granizo |

Para códigos desconhecidos, deve existir uma descrição neutra como “Condição não identificada”, sem quebrar a renderização.

### RF08 — Estados da interface

O sistema deve possuir os seguintes estados:

1. **Inicial/empty state:** nenhuma cidade foi pesquisada; orientar a pessoa a buscar uma cidade.
2. **Loading:** busca em andamento; manter o campo disponível, mas desabilitar submissões duplicadas.
3. **Sucesso:** exibir painel completo com os dados atuais.
4. **Cidade não encontrada:** informar que não foi possível localizar a cidade e permitir nova tentativa.
5. **Erro de clima ou rede:** informar que os dados não puderam ser carregados e oferecer nova tentativa.
6. **Entrada inválida:** informar que o nome da cidade é obrigatório.

Uma busca malsucedida não deve exibir dados antigos como se fossem resultado da nova pesquisa.

## 6. Requisitos não funcionais

### RNF01 — Responsividade

O layout deve funcionar em telas desktop e mobile. Em telas estreitas, a sidebar e a área principal devem ser empilhadas verticalmente sem perda de informação ou rolagem horizontal.

### RNF02 — Acessibilidade

- Usar `label` associado ao campo de busca.
- Usar HTML semântico para formulário, cabeçalho, navegação visual e conteúdo principal.
- O fluxo completo deve funcionar por teclado.
- O foco deve permanecer visível.
- Mensagens de erro e loading devem ser anunciadas com região apropriada, como `aria-live`.
- Ícones decorativos não devem competir com o texto; ícones informativos devem ter alternativa textual.
- Contraste entre texto e fundo deve ser suficiente para leitura.
- Não usar apenas cor para comunicar estado.

### RNF03 — Compatibilidade

O MVP deve suportar versões atuais dos navegadores modernos com suporte a Fetch API, ES Modules e CSS moderno.

### RNF04 — Confiabilidade

Respostas HTTP malsucedidas, respostas sem os campos necessários, resultados vazios e falhas de rede devem ser tratados explicitamente. A aplicação não deve mascarar uma falha como sucesso.

### RNF05 — Segurança e privacidade

- Não armazenar dados pessoais.
- Não incluir chaves secretas no frontend; a Open-Meteo é consumida sem segredo no escopo definido.
- Codificar parâmetros da URL antes de montar as requisições.
- Validar a estrutura das respostas antes de renderizar os valores.

## 7. Detalhes técnicos e arquitetura

### Stack

- Vite
- TypeScript
- Vanilla TypeScript/DOM
- HTML semântico
- CSS
- Fetch API

### Organização recomendada

```text
src/
  api/
    openMeteo.ts
  domain/
    weather.ts
    weatherCode.ts
  ui/
    render.ts
    state.ts
  main.ts
```

Os nomes podem seguir a organização já existente no projeto, mas a separação de responsabilidades deve ser preservada.

### Camada de integração

O arquivo responsável pela Open-Meteo deve concentrar:

- construção das URLs;
- codificação dos parâmetros;
- chamadas HTTP;
- validação mínima de status e payload;
- transformação da resposta da API em modelos internos;
- propagação explícita de erros.

O restante da aplicação não deve chamar `fetch` diretamente para os endpoints da Open-Meteo. Isso mantém o provedor desacoplado e simplifica uma futura substituição.

### Modelo interno sugerido

```ts
type Location = {
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  timezone: string;
};

type CurrentWeather = {
  time: string;
  temperature: number;
  relativeHumidity: number;
  apparentTemperature: number;
  isDay: boolean;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windDirection: number;
  windSpeed: number;
  units: {
    temperature: string;
    relativeHumidity: string;
    apparentTemperature: string;
    precipitationProbability: string;
    precipitation: string;
    windDirection: string;
    windSpeed: string;
  };
};
```

Os nomes internos devem ser independentes dos nomes da API, permitindo que a camada de integração seja substituída sem alterar a UI.

### Fluxo técnico da busca

1. Ler e normalizar o valor do formulário.
2. Validar que o valor não está vazio.
3. Alterar o estado para `loading`.
4. Chamar a função de geocodificação.
5. Se não houver localização válida, alterar o estado para `not-found`.
6. Chamar a função de clima usando latitude, longitude e timezone.
7. Validar os campos obrigatórios da resposta.
8. Transformar os dados para o modelo interno.
9. Renderizar o estado `success`.
10. Em erro de rede, HTTP ou payload, renderizar o estado `error`.

As funções de integração devem validar seus parâmetros de entrada. Parâmetros ausentes ou inválidos devem resultar em erro controlado, sem fazer uma requisição incompleta.

### Concorrência e requisições

O botão deve ser desabilitado durante a operação. Se o projeto permitir novas submissões enquanto uma busca ainda estiver em andamento, a resposta anterior deve ser ignorada quando não corresponder à última busca; para o MVP, a recomendação é impedir a submissão duplicada.

## 8. Instruções visuais e UX

### Composição

- Fundo geral cinza escuro.
- Área superior sem background próprio, centralizada, contendo apenas a busca.
- Painel de resultados centralizado, com largura máxima de `800px`.
- Painel de resultados com fundo branco e bordas bem arredondadas.
- Dentro do painel, sidebar à esquerda e conteúdo principal à direita em desktop.
- Espaçamento interno consistente e suficiente para separar resumo de detalhes.

### Sidebar

A sidebar deve dar prioridade visual à temperatura atual. Abaixo dela, devem aparecer cidade, país, horário local, período do dia e condição meteorológica.

O ícone de clima deve reforçar a descrição textual, nunca substituí-la. O estado de dia/noite pode alterar o ícone ou um detalhe visual, mas não deve depender apenas da cor.

### Área principal

Os detalhes devem ser organizados em blocos ou cards menores, com rótulos curtos e valores visualmente destacados. Cada valor deve apresentar sua unidade.

### Busca

- Campo amplo e facilmente identificável.
- Placeholder orientando a digitar uma cidade.
- Botão com texto ou ícone acompanhado de nome acessível.
- Estado de foco claramente visível.
- Mensagem de erro próxima ao campo quando a entrada for inválida.

### Responsividade

Em mobile:

- a busca deve ocupar a largura disponível;
- o painel deve ocupar a largura disponível com margens laterais;
- a sidebar deve aparecer acima dos detalhes;
- os blocos de detalhes podem formar uma grade de uma ou duas colunas;
- nenhum texto ou valor essencial deve ser cortado.

## 9. Critérios de aceite

- [ ] Ao abrir a aplicação sem pesquisa, o empty state é exibido.
- [ ] Uma cidade válida dispara as duas consultas em uma única ação de usuário.
- [ ] O loading permanece visível durante todo o fluxo de geocodificação e clima.
- [ ] O resultado exibe nome, país, temperatura, data/hora local e condição meteorológica.
- [ ] O resultado exibe umidade, sensação térmica, probabilidade de precipitação e vento.
- [ ] O `weather_code` é convertido em descrição em português e ícone.
- [ ] A data/hora utiliza o timezone retornado para a cidade.
- [ ] Campo vazio não dispara requisição e apresenta orientação ao usuário.
- [ ] Cidade inexistente apresenta estado de não encontrado.
- [ ] Falha de rede, HTTP ou payload apresenta erro explícito e opção de tentar novamente.
- [ ] Uma nova busca não mantém dados antigos apresentados como se fossem atuais.
- [ ] A busca funciona com botão e Enter.
- [ ] O layout funciona em desktop e mobile.
- [ ] O fluxo é operável por teclado e possui labels, foco visível e mensagens acessíveis.
- [ ] A UI não faz chamadas diretas à Open-Meteo fora da camada de integração.

## 10. Testes essenciais

### Testes unitários

- Normalização e validação do nome da cidade.
- Construção das URLs com parâmetros codificados.
- Validação de parâmetros obrigatórios.
- Transformação dos payloads da Open-Meteo.
- Mapeamento de todos os grupos de `weather_code`.
- Fallback para código desconhecido.
- Formatação de data/hora usando o timezone da localização.

### Testes de integração ou comportamento

- Busca bem-sucedida com geocodificação e clima.
- Resultado vazio na geocodificação.
- Erro na consulta de clima.
- Resposta inválida ou incompleta.
- Bloqueio de submissão durante loading.
- Busca por Enter e por botão.
- Renderização dos estados inicial, loading, sucesso e erro.

## 11. Métricas e observabilidade do MVP

Não haverá backend ou telemetria obrigatória no MVP. Durante o desenvolvimento, erros devem ser identificáveis no console em ambiente de desenvolvimento sem expor dados sensíveis. A experiência deve ser avaliada principalmente pelos critérios de aceite e pela execução dos testes essenciais.

## 12. Definição de pronto

O MVP estará pronto quando os critérios de aceite forem atendidos, os testes essenciais passarem, a aplicação estiver tipada sem erros de TypeScript e o layout tiver sido validado em uma viewport desktop e uma viewport mobile.
