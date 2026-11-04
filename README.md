# App de Clima

Aplicação web para consultar o clima atual de uma cidade. A interface está em português do Brasil e exibe temperatura, condição meteorológica, umidade, sensação térmica, precipitação e vento.

## Demonstração

https://wgutto.github.io/app-de-clima/

## Funcionalidades

- Busca de cidades por nome.
- Consulta de localização e clima atual.
- Exibição de data e hora local da cidade.
- Descrição em português das condições meteorológicas.
- Estados de carregamento, sucesso, erro e cidade não encontrada.
- Layout responsivo e acessível.

## Tecnologias

- TypeScript
- Vite
- HTML e CSS
- Vitest
- [Open-Meteo](https://open-meteo.com/) para geocodificação e dados meteorológicos

Não é necessária uma chave de API.

## Executar localmente

Requisitos: Node.js 22 ou superior e npm.

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite no navegador.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Verifica os tipos e gera a versão de produção em `dist/` |
| `npm run preview` | Inicia um servidor para visualizar o build |
| `npm test` | Executa os testes automatizados |

## Estrutura principal

```text
src/
├── api/                  # Integração com a Open-Meteo
├── domain/               # Modelos, estados e regras de formatação
├── main.ts               # Inicialização e interação da aplicação
└── style.css             # Estilos da interface
```

## Deploy

O workflow [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) executa automaticamente quando há alterações na branch `main`:

1. Instala as dependências com `npm ci`.
2. Executa `npm run build`.
3. Publica o conteúdo de `dist/` no GitHub Pages.

O caminho base do Vite está configurado para `/app-de-clima/` em [`vite.config.ts`](vite.config.ts).
