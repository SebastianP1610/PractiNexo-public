import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
const { conectarDB, desconectarDB, limpiarDB } = require('./helpers/mongo');

const {
  generarReporteOfertas,
  exportarCsvOfertas,
} = require('../src/services/reporteOfertasService');

const Oferta = require('../src/models/oferta');
const Dependencia = require('../src/models/dependencia');
const Categoria = require('../src/models/categoria');

describe('reporteOfertasService — integración con MongoDB (TDD fase 6)', () => {
  let dep1, dep2, cat1;

  beforeAll(async () => {
    await conectarDB();
  });

  afterAll(async () => {
    await desconectarDB();
  });

  beforeEach(async () => {
    await limpiarDB();
    dep1 = await Dependencia.create({ nombre: 'Sistemas' });
    dep2 = await Dependencia.create({ nombre: 'Biblioteca' });
    cat1 = await Categoria.create({ nombre: 'Tecnología' });

    await Oferta.create({
      titulo: 'Oferta A',
      descripcion: 'Descripción de oferta A con suficientes caracteres',
      tipoOportunidad: 'PRACTICA',
      contacto: 'test@test.com',
      dependenciaId: dep1._id,
      categoriaId: cat1._id,
      estadoVigencia: 'ACTIVA',
    });
    await Oferta.create({
      titulo: 'Oferta B',
      descripcion: 'Descripción de oferta B con suficientes caracteres',
      tipoOportunidad: 'SERVICIO_SOCIAL',
      contacto: 'test@test.com',
      dependenciaId: dep2._id,
      categoriaId: cat1._id,
      estadoVigencia: 'ACTIVA',
    });
    await Oferta.create({
      titulo: 'Oferta C',
      descripcion: 'Descripción de oferta C con suficientes caracteres',
      tipoOportunidad: 'PRACTICA',
      contacto: 'test@test.com',
      dependenciaId: dep1._id,
      categoriaId: cat1._id,
      estadoVigencia: 'INACTIVA',
    });
  });

  it('genera estadísticas con datos reales de la BD', async () => {
    const stats = await generarReporteOfertas();

    expect(stats.total).toBe(3);
    expect(stats.porEstado).toEqual({ ACTIVA: 2, INACTIVA: 1 });
    expect(stats.porTipo).toEqual({ PRACTICA: 2, SERVICIO_SOCIAL: 1 });
    expect(stats.porDependencia['Sistemas']).toBe(2);
    expect(stats.porDependencia['Biblioteca']).toBe(1);
  });

  it('exporta CSV con datos reales de la BD', async () => {
    const csv = await exportarCsvOfertas();
    const lineas = csv.split('\n');

    expect(lineas[0]).toBe('Titulo;Estado;Tipo;Dependencia');
    expect(lineas.length).toBe(4); // 1 header + 3 datos
    expect(lineas[1]).toContain('Oferta');
  });

  it('retorna datos vacíos cuando no hay ofertas', async () => {
    await limpiarDB();
    const stats = await generarReporteOfertas();
    expect(stats.total).toBe(0);
  });
});
