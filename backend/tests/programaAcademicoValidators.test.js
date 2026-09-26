import { describe, it, expect } from 'vitest';
import {
  validarNombrePrograma,
  validarCodigoPrograma,
  validarNivelAcademico,
  validarEstadoPrograma,
  normalizarNombrePrograma,
} from '../src/services/programaAcademicoValidators';

describe('programaAcademicoValidators — validaciones puras (TDD fase 1)', () => {
  describe('normalizarNombrePrograma', () => {
    it('recorta espacios y colapsa espacios internos', () => {
      expect(normalizarNombrePrograma('  Ingeniería   de  Sistemas  ')).toBe(
        'Ingeniería de Sistemas',
      );
    });

    it('retorna cadena vacía para null/undefined', () => {
      expect(normalizarNombrePrograma(null)).toBe('');
      expect(normalizarNombrePrograma(undefined)).toBe('');
    });
  });

  describe('validarNombrePrograma', () => {
    it('acepta un nombre válido y devuelve el valor normalizado', () => {
      expect(validarNombrePrograma('Ingeniería de Sistemas')).toBe('Ingeniería de Sistemas');
    });

    it('rechaza nombre vacío o solo espacios', () => {
      expect(() => validarNombrePrograma('   ')).toThrow();
      expect(() => validarNombrePrograma('')).toThrow();
    });

    it('rechaza nombre con menos de 5 caracteres', () => {
      expect(() => validarNombrePrograma('Ing')).toThrow(/al menos 5 caracteres/);
    });

    it('rechaza nombre con más de 120 caracteres', () => {
      expect(() => validarNombrePrograma('A'.repeat(121))).toThrow(/no puede superar/);
    });
  });

  describe('validarCodigoPrograma', () => {
    it('acepta códigos alfanuméricos en mayúsculas', () => {
      expect(validarCodigoPrograma('IS-2024')).toBe('IS-2024');
      expect(validarCodigoPrograma('ing-01')).toBe('ING-01');
    });

    it('retorna null cuando el código no se envía', () => {
      expect(validarCodigoPrograma(undefined)).toBeNull();
      expect(validarCodigoPrograma('')).toBeNull();
    });

    it('rechaza códigos con caracteres no permitidos', () => {
      expect(() => validarCodigoPrograma('IS 2024')).toThrow(/formato válido/);
      expect(() => validarCodigoPrograma('IS@2024')).toThrow(/formato válido/);
    });

    it('rechaza códigos de menos de 2 caracteres', () => {
      expect(() => validarCodigoPrograma('A')).toThrow(/formato válido/);
    });
  });

  describe('validarNivelAcademico', () => {
    it('acepta niveles permitidos', () => {
      expect(validarNivelAcademico('PROFESIONAL')).toBe('PROFESIONAL');
      expect(validarNivelAcademico('TECNOLOGIA')).toBe('TECNOLOGIA');
      expect(validarNivelAcademico('TECNICA')).toBe('TECNICA');
    });

    it('normaliza a mayúsculas', () => {
      expect(validarNivelAcademico('profesional')).toBe('PROFESIONAL');
    });

    it('usa PROFESIONAL por defecto cuando viene vacío', () => {
      expect(validarNivelAcademico(undefined)).toBe('PROFESIONAL');
      expect(validarNivelAcademico('')).toBe('PROFESIONAL');
    });

    it('rechaza niveles no reconocidos', () => {
      expect(() => validarNivelAcademico('DOCTORADO')).toThrow(/nivel académico válido/);
    });
  });

  describe('validarEstadoPrograma', () => {
    it('acepta ACTIVO e INACTIVO', () => {
      expect(validarEstadoPrograma('ACTIVO')).toBe('ACTIVO');
      expect(validarEstadoPrograma('inactivo')).toBe('INACTIVO');
    });

    it('usa ACTIVO por defecto', () => {
      expect(validarEstadoPrograma(undefined)).toBe('ACTIVO');
    });

    it('rechaza estados no permitidos', () => {
      expect(() => validarEstadoPrograma('BORRADO')).toThrow(/estado válido/);
    });
  });
});
