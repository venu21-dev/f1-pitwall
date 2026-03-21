import { describe, it, expect } from 'vitest'
import { getNationalityFlag, getNationalityCode } from '@/utils/nationalities'

describe('getNationalityFlag', () => {
  it('gibt das korrekte Flaggen-Emoji für bekannte Nationalitäten zurück', () => {
    expect(getNationalityFlag('British')).toBe('🇬🇧')
    expect(getNationalityFlag('Dutch')).toBe('🇳🇱')
    expect(getNationalityFlag('German')).toBe('🇩🇪')
    expect(getNationalityFlag('Monegasque')).toBe('🇲🇨')
  })

  it('gibt leeren String für unbekannte Nationalitäten zurück', () => {
    expect(getNationalityFlag('Martian')).toBe('')
    expect(getNationalityFlag('')).toBe('')
  })

  it('gibt leeren String zurück wenn kein Argument übergeben wird', () => {
    expect(getNationalityFlag()).toBe('')
  })
})

describe('getNationalityCode', () => {
  it('gibt den korrekten 3-Buchstaben-Code zurück', () => {
    expect(getNationalityCode('British')).toBe('GBR')
    expect(getNationalityCode('Dutch')).toBe('NED')
    expect(getNationalityCode('Spanish')).toBe('ESP')
  })

  it('gibt die ersten 3 Buchstaben für unbekannte Nationalitäten zurück', () => {
    expect(getNationalityCode('Martian')).toBe('MAR')
  })
})
