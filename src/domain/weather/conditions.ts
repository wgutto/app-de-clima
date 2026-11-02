export type WeatherCondition = {
  description: string
  icon: string
}

const conditions: Record<number, WeatherCondition> = {
  0: { description: 'Céu limpo', icon: 'clear-sky' },
  1: { description: 'Principalmente limpo', icon: 'mainly-clear' },
  2: { description: 'Parcialmente nublado', icon: 'partly-cloudy' },
  3: { description: 'Nublado', icon: 'overcast' },
  45: { description: 'Neblina', icon: 'fog' },
  48: { description: 'Neblina com geada', icon: 'rime-fog' },
  51: { description: 'Chuvisco fraco', icon: 'drizzle-light' },
  53: { description: 'Chuvisco moderado', icon: 'drizzle-moderate' },
  55: { description: 'Chuvisco intenso', icon: 'drizzle-dense' },
  56: { description: 'Chuvisco congelante fraco', icon: 'freezing-drizzle-light' },
  57: { description: 'Chuvisco congelante intenso', icon: 'freezing-drizzle-dense' },
  61: { description: 'Chuva fraca', icon: 'rain-light' },
  63: { description: 'Chuva moderada', icon: 'rain-moderate' },
  65: { description: 'Chuva intensa', icon: 'rain-heavy' },
  66: { description: 'Chuva congelante fraca', icon: 'freezing-rain-light' },
  67: { description: 'Chuva congelante intensa', icon: 'freezing-rain-heavy' },
  71: { description: 'Neve fraca', icon: 'snow-light' },
  73: { description: 'Neve moderada', icon: 'snow-moderate' },
  75: { description: 'Neve intensa', icon: 'snow-heavy' },
  77: { description: 'Grãos de neve', icon: 'snow-grains' },
  80: { description: 'Pancadas de chuva fracas', icon: 'rain-showers-light' },
  81: { description: 'Pancadas de chuva moderadas', icon: 'rain-showers-moderate' },
  82: { description: 'Pancadas de chuva violentas', icon: 'rain-showers-violent' },
  85: { description: 'Pancadas de neve fracas', icon: 'snow-showers-light' },
  86: { description: 'Pancadas de neve intensas', icon: 'snow-showers-heavy' },
  95: { description: 'Trovoada fraca ou moderada', icon: 'thunderstorm' },
  96: { description: 'Trovoada com granizo fraco', icon: 'thunderstorm-hail-light' },
  99: { description: 'Trovoada com granizo intenso', icon: 'thunderstorm-hail-heavy' },
}

const unknownCondition: WeatherCondition = {
  description: 'Condição não identificada',
  icon: 'unknown',
}

export const getWeatherCondition = (code: number): WeatherCondition =>
  conditions[code] ?? unknownCondition
