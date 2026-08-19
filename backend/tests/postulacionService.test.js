import { describe, it, expect } from 'vitest';
import { puedeTransitar } from '../src/services/postulacionService';

describe('puedeTransitar — reglas de transición de postulaciones', () => {
  it('permite avanzar desde PENDIENTE hacia revisión, aceptada y rechazada', () => {
    expect(puedeTransitar('PENDIENTE', 'EN_REVISION')).toBe(true);
    expect(puedeTransitar('PENDIENTE', 'ACEPTADA')).toBe(true);
    expect(puedeTransitar('PENDIENTE', 'RECHAZADA')).toBe(true);
  });

  it('permite resolver desde EN_REVISION', () => {
    expect(puedeTransitar('EN_REVISION', 'ACEPTADA')).toBe(true);
    expect(puedeTransitar('EN_REVISION', 'RECHAZADA')).toBe(true);
    expect(puedeTransitar('EN_REVISION', 'PENDIENTE')).toBe(true);
  });

  it('permite revertir entre ACEPTADA y RECHAZADA', () => {
    expect(puedeTransitar('ACEPTADA', 'RECHAZADA')).toBe(true);
    expect(puedeTransitar('ACEPTADA', 'EN_REVISION')).toBe(true);
    expect(puedeTransitar('RECHAZADA', 'ACEPTADA')).toBe(true);
    expect(puedeTransitar('RECHAZADA', 'EN_REVISION')).toBe(true);
  });

  it('no permite cambiar a CANCELADA desde ningún estado', () => {
    expect(puedeTransitar('PENDIENTE', 'CANCELADA')).toBe(false);
    expect(puedeTransitar('EN_REVISION', 'CANCELADA')).toBe(false);
    expect(puedeTransitar('ACEPTADA', 'CANCELADA')).toBe(false);
    expect(puedeTransitar('RECHAZADA', 'CANCELADA')).toBe(false);
  });

  it('no permite cambiar una postulacion CANCELADA', () => {
    expect(puedeTransitar('CANCELADA', 'PENDIENTE')).toBe(false);
    expect(puedeTransitar('CANCELADA', 'ACEPTADA')).toBe(false);
    expect(puedeTransitar('CANCELADA', 'RECHAZADA')).toBe(false);
    expect(puedeTransitar('CANCELADA', 'EN_REVISION')).toBe(false);
  });

  it('no permite transiciones hacia el mismo estado', () => {
    expect(puedeTransitar('PENDIENTE', 'PENDIENTE')).toBe(false);
    expect(puedeTransitar('EN_REVISION', 'EN_REVISION')).toBe(false);
    expect(puedeTransitar('ACEPTADA', 'ACEPTADA')).toBe(false);
  });

  it('rechaza estados invalidos', () => {
    expect(puedeTransitar('PENDIENTE', 'INVALIDO')).toBe(false);
    expect(puedeTransitar('INVALIDO', 'ACEPTADA')).toBe(false);
    expect(puedeTransitar('', 'ACEPTADA')).toBe(false);
  });
});