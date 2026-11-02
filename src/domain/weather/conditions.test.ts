import { describe, expect, it } from 'vitest'
import { getWeatherCondition } from './conditions.ts'

describe('getWeatherCondition', () => {
  it.each([
    [0, 'Céu limpo'],
    [1, 'Principalmente limpo'],
    [2, 'Parcialmente nublado'],
    [3, 'Nublado'],
    [45, 'Neblina'],
    [48, 'Neblina com geada'],
    [51, 'Chuvisco fraco'],
    [53, 'Chuvisco moderado'],
    [55, 'Chuvisco intenso'],
    [56, 'Chuvisco congelante fraco'],
    [57, 'Chuvisco congelante intenso'],
    [61, 'Chuva fraca'],
    [63, 'Chuva moderada'],
    [65, 'Chuva intensa'],
    [66, 'Chuva congelante fraca'],
    [67, 'Chuva congelante intensa'],
    [71, 'Neve fraca'],
    [73, 'Neve moderada'],
    [75, 'Neve intensa'],
    [77, 'Grãos de neve'],
    [80, 'Pancadas de chuva fracas'],
    [81, 'Pancadas de chuva moderadas'],
    [82, 'Pancadas de chuva violentas'],
    [85, 'Pancadas de neve fracas'],
    [86, 'Pancadas de neve intensas'],
    [95, 'Trovoada fraca ou moderada'],
    [96, 'Trovoada com granizo fraco'],
    [99, 'Trovoada com granizo intenso'],
  ])('mapeia o código %i', (code, description) => {
    const condition = getWeatherCondition(code)

    expect(condition.description).toBe(description)
    expect(condition.icon).not.toBe('')
  })

  it('usa fallback para códigos desconhecidos', () => {
    expect(getWeatherCondition(999)).toEqual({
      description: 'Condição não identificada',
      icon: 'unknown',
    })
  })
})
