import { describe, expect, it } from 'vitest'
import {
  formatLocalDateTime,
  formatPercentage,
  formatTemperature,
  formatWindDirection,
  formatWindSpeed,
  isValidCityQuery,
  normalizeCityQuery,
} from './formatters.ts'

describe('normalização da pesquisa', () => {
  it('remove espaços nas extremidades', () => {
    expect(normalizeCityQuery('  Rio de Janeiro  ')).toBe('Rio de Janeiro')
  })

  it('identifica entradas vazias', () => {
    expect(isValidCityQuery('   ')).toBe(false)
    expect(isValidCityQuery('Recife')).toBe(true)
  })
})

describe('formatação de valores meteorológicos', () => {
  it('formata temperatura sem duplicar a unidade', () => {
    expect(formatTemperature(23.5, '°C')).toBe('23,5 °C')
  })

  it('formata percentuais e velocidade do vento', () => {
    expect(formatPercentage(80)).toBe('80 %')
    expect(formatWindSpeed(12.4)).toBe('12,4 km/h')
  })

  it('arredonda a direção do vento e adiciona graus', () => {
    expect(formatWindDirection(132.6)).toBe('133 °')
  })

  it('usa fallback para números inválidos', () => {
    expect(formatTemperature(Number.NaN)).toBe('—')
  })
})

describe('formatação de data e hora', () => {
  it('mantém o horário local retornado pela cidade', () => {
    expect(formatLocalDateTime('2026-11-02T16:15', 'America/Sao_Paulo')).toBe(
      '02/11/2026, 16:15',
    )
  })

  it('retorna fallback para data inválida', () => {
    expect(formatLocalDateTime('data inválida', 'America/Sao_Paulo')).toBe('—')
  })
})
