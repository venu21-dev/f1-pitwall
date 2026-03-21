import { describe, it, expect } from 'vitest'
import { getTeamColor, TEAM_COLORS } from '@/utils/teamColors'

describe('getTeamColor', () => {
  it('gibt die korrekte Farbe für bekannte Teams zurück', () => {
    expect(getTeamColor('mercedes')).toBe('#27F4D2')
    expect(getTeamColor('ferrari')).toBe('#E8002D')
    expect(getTeamColor('red_bull')).toBe('#3671C6')
    expect(getTeamColor('mclaren')).toBe('#FF8000')
  })

  it('ist case-insensitive', () => {
    expect(getTeamColor('Mercedes')).toBe(TEAM_COLORS['mercedes'])
    expect(getTeamColor('FERRARI')).toBe(TEAM_COLORS['ferrari'])
  })

  it('gibt Fallback-Farbe für unbekannte Teams zurück', () => {
    expect(getTeamColor('unbekannt')).toBe('#555566')
    expect(getTeamColor('')).toBe('#555566')
  })

  it('gibt Fallback-Farbe zurück wenn kein Argument übergeben wird', () => {
    expect(getTeamColor()).toBe('#555566')
  })
})
