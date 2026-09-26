import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
const { conectarDB, desconectarDB, limpiarDB } = require('./helpers/mongo');

const {
  crearPrograma,
  listarProgramas,
  actualizarPrograma,
  eliminarPrograma,
} = require('../src/services/programaAcademicoService');

const ProgramaAcademico = require('../src/models/programaAcademico');

describe('programaAcademicoService — integración con MongoDB (TDD fase 6)', () => {
  beforeAll(async () => {
    await conectarDB();
  });

  afterAll(async () => {
    await desconectarDB();
  });

  beforeEach(async () => {
    await limpiarDB();
  });

  describe('crearPrograma', () => {
    it('crea un programa válido en la base de datos', async () => {
      const programa = await crearPrograma({
        nombre: 'Ingeniería de Sistemas',
        codigo: 'IS-01',
        nivelAcademico: 'PROFESIONAL',
        facultad: 'Ingeniería',
        descripcion: 'Programa de Ingeniería de Sistemas',
      });

      expect(programa._id).toBeDefined();
      expect(programa.nombre).toBe('Ingeniería de Sistemas');
      expect(programa.codigo).toBe('IS-01');
      expect(programa.estado).toBe('ACTIVO');

      const encontrado = await ProgramaAcademico.findById(programa._id);
      expect(encontrado).not.toBeNull();
    });

    it('rechaza programa con nombre duplicado', async () => {
      await crearPrograma({ nombre: 'Derecho', codigo: 'DER-01' });

      await expect(crearPrograma({ nombre: 'Derecho', codigo: 'DER-02' })).rejects.toThrow(
        /ya existe/i,
      );
    });

    it('rechaza programa con código duplicado', async () => {
      await crearPrograma({ nombre: 'Derecho', codigo: 'DER-01' });

      await expect(crearPrograma({ nombre: 'Filosofía', codigo: 'DER-01' })).rejects.toThrow(
        /ya existe/i,
      );
    });

    it('rechaza nombre inválido', async () => {
      await expect(crearPrograma({ nombre: 'AB' })).rejects.toThrow();
    });
  });

  describe('listarProgramas', () => {
    it('lista todos los programas', async () => {
      await crearPrograma({ nombre: 'Ingeniería de Sistemas', codigo: 'IS-01' });
      await crearPrograma({ nombre: 'Derecho', codigo: 'DER-01' });

      const lista = await listarProgramas();
      expect(lista.length).toBe(2);
    });

    it('filtra por estado', async () => {
      await crearPrograma({ nombre: 'Ingeniería de Sistemas', codigo: 'IS-01', estado: 'ACTIVO' });
      await crearPrograma({ nombre: 'Derecho', codigo: 'DER-01', estado: 'INACTIVO' });

      const activos = await listarProgramas({ estado: 'ACTIVO' });
      expect(activos.length).toBe(1);
      expect(activos[0].nombre).toBe('Ingeniería de Sistemas');
    });
  });

  describe('actualizarPrograma', () => {
    it('actualiza un programa existente', async () => {
      const programa = await crearPrograma({ nombre: 'Derecho', codigo: 'DER-01' });

      const actualizado = await actualizarPrograma(programa._id, {
        nombre: 'Derecho Penal',
        estado: 'INACTIVO',
      });

      expect(actualizado.nombre).toBe('Derecho Penal');
      expect(actualizado.estado).toBe('INACTIVO');
    });

    it('lanza error si el programa no existe', async () => {
      const idInexistente = '507f1f77bcf86cd799439011';
      await expect(actualizarPrograma(idInexistente, { nombre: 'X' })).rejects.toThrow(
        /no existe/i,
      );
    });
  });

  describe('eliminarPrograma', () => {
    it('elimina un programa existente', async () => {
      const programa = await crearPrograma({ nombre: 'Derecho', codigo: 'DER-01' });

      await eliminarPrograma(programa._id);

      const encontrado = await ProgramaAcademico.findById(programa._id);
      expect(encontrado).toBeNull();
    });

    it('lanza error si el programa no existe', async () => {
      const idInexistente = '507f1f77bcf86cd799439011';
      await expect(eliminarPrograma(idInexistente)).rejects.toThrow(/no existe/i);
    });
  });
});
