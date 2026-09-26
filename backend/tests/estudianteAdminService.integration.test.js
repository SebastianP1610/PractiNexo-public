import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
const { conectarDB, desconectarDB, limpiarDB } = require('./helpers/mongo');

const {
  crearEstudianteAdmin,
  listarEstudiantesAdmin,
  obtenerEstudianteAdmin,
  actualizarEstudianteAdmin,
  eliminarEstudianteAdmin,
} = require('../src/services/estudianteAdminService');

const Estudiante = require('../src/models/estudiante');

describe('estudianteAdminService — integración con MongoDB (TDD fase 6)', () => {
  beforeAll(async () => {
    await conectarDB();
  });

  afterAll(async () => {
    await desconectarDB();
  });

  beforeEach(async () => {
    await limpiarDB();
  });

  describe('crearEstudianteAdmin', () => {
    it('crea un estudiante válido sin exponer passwordHash', async () => {
      const estudiante = await crearEstudianteAdmin({
        nombre: 'Juan Pérez',
        correo: 'juan@test.com',
        password: 'secret123',
        programaAcademico: 'Ingeniería de Sistemas',
        estado: 'ACTIVO',
      });

      expect(estudiante._id).toBeDefined();
      expect(estudiante.nombre).toBe('Juan Pérez');
      expect(estudiante.correo).toBe('juan@test.com');
      expect(estudiante.passwordHash).toBeUndefined();
      expect(estudiante.resetPasswordTokenHash).toBeUndefined();
      expect(estudiante.resetPasswordExpires).toBeUndefined();
    });

    it('rechaza correo duplicado', async () => {
      await crearEstudianteAdmin({
        nombre: 'Juan',
        correo: 'dup@test.com',
        password: 'secret123',
      });

      await expect(
        crearEstudianteAdmin({
          nombre: 'Otro',
          correo: 'dup@test.com',
          password: 'secret123',
        }),
      ).rejects.toThrow(/ya existe/i);
    });

    it('rechaza contraseña corta', async () => {
      await expect(
        crearEstudianteAdmin({
          nombre: 'Juan',
          correo: 'short@test.com',
          password: '123',
        }),
      ).rejects.toThrow(/contraseña/i);
    });

    it('normaliza correo a minúsculas', async () => {
      const estudiante = await crearEstudianteAdmin({
        nombre: 'Ana',
        correo: 'Ana.Lopez@TEST.com',
        password: 'secret123',
      });

      expect(estudiante.correo).toBe('ana.lopez@test.com');
    });
  });

  describe('listarEstudiantesAdmin', () => {
    it('lista estudiantes con paginación', async () => {
      for (let i = 1; i <= 25; i++) {
        await crearEstudianteAdmin({
          nombre: `Estudiante ${i}`,
          correo: `est${i}@test.com`,
          password: 'secret123',
        });
      }

      const pagina1 = await listarEstudiantesAdmin({ page: 1, limit: 20 });
      expect(pagina1.data.length).toBe(20);
      expect(pagina1.total).toBe(25);
      expect(pagina1.pages).toBe(2);

      const pagina2 = await listarEstudiantesAdmin({ page: 2, limit: 20 });
      expect(pagina2.data.length).toBe(5);
    });

    it('filtra por estado', async () => {
      await crearEstudianteAdmin({ nombre: 'Activo', correo: 'a@test.com', password: 'secret123', estado: 'ACTIVO' });
      await crearEstudianteAdmin({ nombre: 'Inactivo', correo: 'i@test.com', password: 'secret123', estado: 'INACTIVO' });

      const activos = await listarEstudiantesAdmin({ estado: 'ACTIVO' });
      expect(activos.total).toBe(1);
    });

    it('filtra por búsqueda de texto', async () => {
      await crearEstudianteAdmin({ nombre: 'Juan Pérez', correo: 'juan@test.com', password: 'secret123' });
      await crearEstudianteAdmin({ nombre: 'Ana López', correo: 'ana@test.com', password: 'secret123' });

      const resultado = await listarEstudiantesAdmin({ busqueda: 'juan' });
      expect(resultado.total).toBe(1);
    });
  });

  describe('obtenerEstudianteAdmin', () => {
    it('obtiene estudiante por id sin campos sensibles', async () => {
      const creado = await crearEstudianteAdmin({
        nombre: 'María',
        correo: 'maria@test.com',
        password: 'secret123',
      });

      const estudiante = await obtenerEstudianteAdmin(creado._id);
      expect(estudiante.nombre).toBe('María');
      expect(estudiante.passwordHash).toBeUndefined();
    });

    it('lanza error si no existe', async () => {
      await expect(obtenerEstudianteAdmin('507f1f77bcf86cd799439011')).rejects.toThrow(
        /no existe/i,
      );
    });
  });

  describe('actualizarEstudianteAdmin', () => {
    it('actualiza nombre y estado', async () => {
      const creado = await crearEstudianteAdmin({
        nombre: 'Pedro',
        correo: 'pedro@test.com',
        password: 'secret123',
      });

      const actualizado = await actualizarEstudianteAdmin(creado._id, {
        nombre: 'Pedro Gómez',
        estado: 'INACTIVO',
      });

      expect(actualizado.nombre).toBe('Pedro Gómez');
      expect(actualizado.estado).toBe('INACTIVO');
      expect(actualizado.passwordHash).toBeUndefined();
    });

    it('rechaza cambio de correo a uno existente', async () => {
      await crearEstudianteAdmin({ nombre: 'Ana', correo: 'a@test.com', password: 'secret123' });
      const b = await crearEstudianteAdmin({ nombre: 'Beto', correo: 'b@test.com', password: 'secret123' });

      await expect(
        actualizarEstudianteAdmin(b._id, { correo: 'a@test.com' }),
      ).rejects.toThrow(/ya existe/i);
    });
  });

  describe('eliminarEstudianteAdmin', () => {
    it('elimina estudiante existente', async () => {
      const creado = await crearEstudianteAdmin({
        nombre: 'Carlos',
        correo: 'carlos@test.com',
        password: 'secret123',
      });

      await eliminarEstudianteAdmin(creado._id);

      const encontrado = await Estudiante.findById(creado._id);
      expect(encontrado).toBeNull();
    });
  });
});
