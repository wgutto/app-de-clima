export type Location = {
  name: string
  latitude: number
  longitude: number
  countryCode: string
  timezone: string
}

export type WeatherUnits = {
  time: string
  temperature: string
  relativeHumidity: string
  apparentTemperature: string
  precipitationProbability: string
  precipitation: string
  weatherCode: string
  windDirection: string
  windSpeed: string
}

export type CurrentWeather = {
  time: string
  temperature: number
  relativeHumidity: number
  apparentTemperature: number
  isDay: boolean
  precipitationProbability: number
  precipitation: number
  weatherCode: number
  windDirection: number
  windSpeed: number
  units: WeatherUnits
}

export type WeatherResult = {
  location: Location
  current: CurrentWeather
}
