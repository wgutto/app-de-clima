# Projeto clima

Este projeto vai pegar a cidade e baseado nisso, consultar o clima daquela região, exibindo as principais informaçãoes de clima, temperatura, humidade e etc. 

### Aspectos Técnicos

O projeto vai ser feito em Vite + Vanilla + Typescript


### Informações da API que será usada no projeto:

Ele vai usar a API OpenMeteo, com os seguintes endpoints:

Para pegar a latitude/longitude e timezone, com base no nome da cidade: https://geocoding-api.open-meteo.com/v1/search?name={NOME_DA_CIDADE}&count=1&language=pt&format=json

{NOME_DA_CIDADE} = Nome da cidade que o usuário digitou

Exemplo de resposta: 

{
  "results": [
    {
      "id": 3451190,
      "name": "Rio de Janeiro",
      "latitude": -22.90642,
      "longitude": -43.18223,
      "elevation": 12,
      "feature_code": "PPLA",
      "country_code": "BR",
      "admin1_id": 3451189,
      "admin2_id": 6322060,
      "timezone": "America/Sao_Paulo",
      "population": 6747815,
      "country_id": 3469034,
      "country": "Brasil",
      "admin1": "Rio de Janeiro",
      "admin2": "Rio de Janeiro"
    }
  ],
  "generationtime_ms": 0.20766258
}

Informações que precisamos: name, latitude, longitude, country_code, timezone.

Para pegar as informações de clima: https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_direction_10m,wind_speed_10m&timezone={TIMEZONE}

{LATITUDE} = Latitude
{LONGITUDE} = Longitude
{TIMEZONE} = Timezone

Exemplo de resposta:

{
  "latitude": 52.512604,
  "longitude": 13.419517,
  "generationtime_ms": 0.203847885131836,
  "utc_offset_seconds": 0,
  "timezone": "GMT",
  "timezone_abbreviation": "GMT",
  "elevation": 38,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "apparent_temperature": "°C",
    "is_day": "",
    "precipitation": "mm",
    "rain": "mm",
    "weather_code": "wmo code",
    "wind_direction_10m": "°",
    "wind_speed_10m": "km/h"
  },
  "current": {
    "time": "2026-10-29T22:00",
    "interval": 900,
    "temperature_2m": 9.5,
    "relative_humidity_2m": 96,
    "apparent_temperature": 8.4,
    "is_day": 0,
    "precipitation": 0,
    "rain": 0,
    "weather_code": 45,
    "wind_direction_10m": 313,
    "wind_speed_10m": 5.9
  }
}

Informações importantes:

Teremos um arquivo com as fuçóes do OpenMeteo, para que o projeto näo faça requisições direta a API, mas sim usando as funçöes, para facilitar uma possível troca futuramente. Será como um desaclopamento

Fluxo de pesquisa para receber o nome da cidade e pegar as informações de clima:
- O usuário digita o nome da cidade.
- O projeto usa o OpenMeteo para pegar a latitude, longitude e timezone da cidade digitada.
- Com base na latitude, longitude e timezone, o projeto usa o OpenMeteo para fazer a requisição e buscar as informações sobre o clima dessa localização.
- Caso não ache as informações da cidade, se comportar como se não tivesse achado nada.
- Caso não acha as informações de clima, se comportar como se não tivesse achado nada.

A busca envolve as 2 requisições (buscar latitude/longitude/timezone + buscar clima), mas para o usuário é uma só, com loading.

As funções do OpenMeteo devem verificar se os parâmetros viera, caso contrario, age como se não tivesse vindo.