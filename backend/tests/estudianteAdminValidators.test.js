import { describe, it, expect } from 'vitest';
import {
  validarNombreEstudiante,
  validarCorreoEstudiante,
  validarEstadoEstudiante,
  sanitizarRespuestaAdmin,
  construirFiltrosAdmin,
} from '../src/services/estudianteAdminValidators';

describe('estudianteAdminValidators — validaciones puras para gestión admin (TDD fase 2)', () => {
  describe('validarNombreEstudiante', () => {
    it('acepta un nombre válido y lo normaliza', () => {
      expect(validarNombreEstudiante('  Juan   Pérez  ')).toBe('Juan Pérez');
    });

    it('rechaza nombre vacío o solo espacios', () => {
      expect(() => validarNombreEstudiante('   ')).toThrow();
      expect(() => validarNombreEstudiante('')).toThrow();
    });

    it('rechaza nombre con menos de 3 caracteres', () => {
      expect(() => validarNombreEstudiante('AB')).toThrow(/al menos 3 caracteres/);
    });

    it('rechaza nombre con más de 100 caracteres', () => {
      expect(() => validarNombreEstudiante('A'.repeat(101))).toThrow(/no puede superar/);
    });
  });

  describe('validarCorreoEstudiante', () => {
    it('acepta un correo válido y lo normaliza a minúsculas', () => {
      expect(validarCorreoEstudiante('  Juan.Perez@PolitecnicoJIC.edu.co  ')).toBe(
        'juan.perez@politecnicojic.edu.co',
      );
    });

    it('rechaza correo vacío', () => {
      expect(() => validarCorreoEstudiante('')).toThrow();
    });

    it('rechaza correo sin formato válido', () => {
      expect(() => validarCorreoEstudiante('no-es-correo')).toThrow(/correo electrónico válido/);
      expect(() => validarCorreoEstudiante('sin-arroba@test')).toThrow(/correo electrónico válido/);
      expect(() => validarCorreoEstudiante('@sinusuario.com')).toThrow(/correo electrónico válido/);
    });
  });

  describe('validarEstadoEstudiante', () => {
    it('acepta ACTIVO e INACTIVO', () => {
      expect(validarEstadoEstudiante('ACTIVO')).toBe('ACTIVO');
      expect(validarEstadoEstudiante('inactivo')).toBe('INACTIVO');
    });

    it('usa ACTIVO por defecto', () => {
      expect(validarEstadoEstudiante(undefined)).toBe('ACTIVO');
    });

    it('rechaza estados no permitidos', () => {
      expect(() => validarEstadoEstudiante('SUSPENDIDO')).toThrow(/estado válido/);
    });
  });

  describe('sanitizarRespuestaAdmin', () => {
    it('elimina passwordHash, resetPasswordTokenHash y resetPasswordExpires', () => {
      const input = {
        nombre: 'Juan',
        correo: 'juan@test.com',
        passwordHash: 'bcrypt$secreto',
        resetPasswordTokenHash: 'tok123',
        resetPasswordExpires: new Date(),
        estado: 'ACTIVO',
      };
      const result = sanitizarRespuestaAdmin(input);
      expect(result.passwordHash).toBeUndefined();
      expect(result.resetPasswordTokenHash).toBeUndefined();
      expect(result.resetPasswordExpires).toBeUndefined();
      expect(result.nombre).toBe('Juan');
      expect(result.estado).toBe('ACTIVO');
    });

    it('retorna null para input nulo', () => {
      expect(sanitizarRespuestaAdmin(null)).toBeNull();
      expect(sanitizarRespuestaAdmin(undefined)).toBeNull();
    });

    it('funciona con objetos Mongoose (toObject)', () => {
      const mongooseLike = {
        toObject: () => ({
          nombre: 'Ana',
          passwordHash: 'hash',
          resetPasswordTokenHash: 'tok',
          resetPasswordExpires: null,
        }),
      };
      const result = sanitizarRespuestaAdmin(mongooseLike);
      expect(result.passwordHash).toBeUndefined();
      expect(result.nombre).toBe('Ana');
    });
  });

  describe('construirFiltrosAdmin', () => {
    it('construye query vacío sin filtros', () => {
      expect(construirFiltrosAdmin({})).toEqual({});
    });

    it('filtra por estado', () => {
      expect(construirFiltrosAdmin({ estado: 'ACTIVO' })).toEqual({ estado: 'ACTIVO' });
      expect(construirFiltrosAdmin({ estado: 'inactivo' })).toEqual({ estado: 'INACTIVO' });
    });

    it('filtra por programa académico (case-insensitive parcial)', () => {
      const q = construirFiltrosAdmin({ programa: 'sistemas' });
      expect(q.programaAcademico).toBeInstanceOf(RegExp);
      expect(q.programaAcademico.test('Ingeniería de Sistemas')).toBe(true);
      expect(q.programaAcademico.test('Derecho')).toBe(false);
    });

    it('filtra por búsqueda de texto en nombre o correo', () => {
      const q = construirFiltrosAdmin({ busqueda: 'juan' });
      expect(q.$or).toBeDefined();
      expect(Array.isArray(q.$or)).toBe(true);
    });

    it('ignora filtros vacíos o undefined', () => {
      expect(construirFiltrosAdmin({ estado: '', programa: '', busqueda: '' })).toEqual({});
    });
  });
});
