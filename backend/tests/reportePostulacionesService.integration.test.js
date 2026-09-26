import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
const { conectarDB, desconectarDB, limpiarDB } = require('./helpers/mongo');

const {
  generarReportePostulaciones,
  exportarCsvPostulaciones,
} = require('../src/services/reportePostulacionesService');

const Postulacion = require('../src/models/postulacion');
const Estudiante = require('../src/models/estudiante');
const Oferta = require('../src/models/oferta');
const Dependencia = require('../src/models/dependencia');
const Categoria = require('../src/models/categoria');

describe('reportePostulacionesService — integración con MongoDB (TDD fase 6)', () => {
  let est1, est2, oferta1, oferta2;

  beforeAll(async () => {
    await conectarDB();
  });

  afterAll(async () => {
    await desconectarDB();
  });

  beforeEach(async () => {
    await limpiarDB();

    est1 = await Estudiante.create({
      nombre: 'Juan Pérez',
      correo: 'juan@test.com',
      passwordHash: 'hash',
    });
    est2 = await Estudiante.create({
      nombre: 'Ana López',
      correo: 'ana@test.com',
      passwordHash: 'hash',
    });

    const dep = await Dependencia.create({ nombre: 'Sistemas' });
    const cat = await Categoria.create({ nombre: 'Tech' });

    oferta1 = await Oferta.create({
      titulo: 'Práctica Sistemas',
      descripcion: 'Descripción de la oferta de práctica profesional',
      tipoOportunidad: 'PRACTICA',
      contacto: 'test@test.com',
      dependenciaId: dep._id,
      categoriaId: cat._id,
    });
    oferta2 = await Oferta.create({
      titulo: 'Servicio Biblioteca',
      descripcion: 'Descripción de la oferta de servicio social',
      tipoOportunidad: 'SERVICIO_SOCIAL',
      contacto: 'test@test.com',
      dependenciaId: dep._id,
      categoriaId: cat._id,
    });

    await Postulacion.create({
      estudianteId: est1._id,
      ofertaId: oferta1._id,
      estado: 'PENDIENTE',
    });
    await Postulacion.create({
      estudianteId: est2._id,
      ofertaId: oferta1._id,
      estado: 'ACEPTADA',
    });
    await Postulacion.create({
      estudianteId: est1._id,
      ofertaId: oferta2._id,
      estado: 'RECHAZADA',
    });
  });

  it('genera estadísticas con datos reales de la BD', async () => {
    const stats = await generarReportePostulaciones();

    expect(stats.total).toBe(3);
    expect(stats.porEstado).toEqual({ PENDIENTE: 1, ACEPTADA: 1, RECHAZADA: 1 });
    expect(stats.porEstudiante['Juan Pérez']).toBe(2);
    expect(stats.porEstudiante['Ana López']).toBe(1);
    expect(stats.porOferta['Práctica Sistemas']).toBe(2);
    expect(stats.porOferta['Servicio Biblioteca']).toBe(1);
    expect(stats.tasaAceptacion).toBe(33); // 1/3 = 33%
  });

  it('exporta CSV con datos reales de la BD', async () => {
    const csv = await exportarCsvPostulaciones();
    const lineas = csv.split('\n');

    expect(lineas[0]).toBe('Estudiante;Oferta;Estado');
    expect(lineas.length).toBe(4);
  });

  it('retorna datos vacíos cuando no hay postulaciones', async () => {
    await limpiarDB();
    const stats = await generarReportePostulaciones();
    expect(stats.total).toBe(0);
    expect(stats.tasaAceptacion).toBe(0);
  });
});
