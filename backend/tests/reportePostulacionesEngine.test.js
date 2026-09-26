import { describe, it, expect } from 'vitest';
import {
  calcularEstadisticasPostulaciones,
  generarCsvPostulaciones,
} from '../src/services/reportePostulacionesEngine';

const postulaciones = [
  { estado: 'PENDIENTE', estudianteNombre: 'Juan Pérez', ofertaTitulo: 'Práctica Sistemas' },
  { estado: 'PENDIENTE', estudianteNombre: 'Ana López', ofertaTitulo: 'Práctica Sistemas' },
  { estado: 'EN_REVISION', estudianteNombre: 'Juan Pérez', ofertaTitulo: 'Servicio Biblioteca' },
  { estado: 'ACEPTADA', estudianteNombre: 'María Gómez', ofertaTitulo: 'Práctica Sistemas' },
  { estado: 'ACEPTADA', estudianteNombre: 'Juan Pérez', ofertaTitulo: 'Servicio Biblioteca' },
  { estado: 'RECHAZADA', estudianteNombre: 'Ana López', ofertaTitulo: 'Servicio Biblioteca' },
  { estado: 'CANCELADA', estudianteNombre: 'María Gómez', ofertaTitulo: 'Práctica Sistemas' },
];

describe('calcularEstadisticasPostulaciones — agregaciones puras (TDD fase 4)', () => {
  it('calcula el total de postulaciones', () => {
    const stats = calcularEstadisticasPostulaciones(postulaciones);
    expect(stats.total).toBe(7);
  });

  it('cuenta postulaciones por estado', () => {
    const stats = calcularEstadisticasPostulaciones(postulaciones);
    expect(stats.porEstado).toEqual({
      PENDIENTE: 2,
      EN_REVISION: 1,
      ACEPTADA: 2,
      RECHAZADA: 1,
      CANCELADA: 1,
    });
  });

  it('cuenta postulaciones por estudiante', () => {
    const stats = calcularEstadisticasPostulaciones(postulaciones);
    expect(stats.porEstudiante).toEqual({
      'Juan Pérez': 3,
      'Ana López': 2,
      'María Gómez': 2,
    });
  });

  it('cuenta postulaciones por oferta', () => {
    const stats = calcularEstadisticasPostulaciones(postulaciones);
    expect(stats.porOferta).toEqual({
      'Práctica Sistemas': 4,
      'Servicio Biblioteca': 3,
    });
  });

  it('incluye lista de estudiantes ordenada por cantidad descendente', () => {
    const stats = calcularEstadisticasPostulaciones(postulaciones);
    expect(stats.estudiantesOrdenados).toEqual([
      { nombre: 'Juan Pérez', cantidad: 3 },
      { nombre: 'Ana López', cantidad: 2 },
      { nombre: 'María Gómez', cantidad: 2 },
    ]);
  });

  it('incluye lista de ofertas ordenada por cantidad descendente', () => {
    const stats = calcularEstadisticasPostulaciones(postulaciones);
    expect(stats.ofertasOrdenadas).toEqual([
      { titulo: 'Práctica Sistemas', cantidad: 4 },
      { titulo: 'Servicio Biblioteca', cantidad: 3 },
    ]);
  });

  it('calcula tasa de aceptación', () => {
    const stats = calcularEstadisticasPostulaciones(postulaciones);
    expect(stats.tasaAceptacion).toBe(Math.round((2 / 7) * 100));
  });

  it('tasa de aceptación es 0 con lista vacía', () => {
    const stats = calcularEstadisticasPostulaciones([]);
    expect(stats.tasaAceptacion).toBe(0);
    expect(stats.total).toBe(0);
  });

  it('maneja postulaciones sin estudiante u oferta asignada', () => {
    const stats = calcularEstadisticasPostulaciones([
      { estado: 'PENDIENTE', estudianteNombre: '', ofertaTitulo: '' },
      { estado: 'PENDIENTE', estudianteNombre: 'Juan', ofertaTitulo: 'Oferta X' },
    ]);
    expect(stats.porEstudiante['Sin estudiante']).toBe(1);
    expect(stats.porOferta['Sin oferta']).toBe(1);
  });
});

describe('generarCsvPostulaciones — exportación CSV pura (TDD fase 4)', () => {
  it('genera CSV con encabezados correctos', () => {
    const csv = generarCsvPostulaciones(postulaciones);
    const lineas = csv.split('\n');
    expect(lineas[0]).toBe('Estudiante;Oferta;Estado');
  });

  it('genera una fila por postulación', () => {
    const csv = generarCsvPostulaciones(postulaciones);
    const lineas = csv.split('\n');
    expect(lineas.length).toBe(8); // 1 header + 7 datos
  });

  it('genera datos correctos en las filas', () => {
    const csv = generarCsvPostulaciones(postulaciones);
    const lineas = csv.split('\n');
    expect(lineas[1]).toBe('Juan Pérez;Práctica Sistemas;PENDIENTE');
    expect(lineas[4]).toBe('María Gómez;Práctica Sistemas;ACEPTADA');
  });

  it('genera solo encabezado con lista vacía', () => {
    const csv = generarCsvPostulaciones([]);
    expect(csv).toBe('Estudiante;Oferta;Estado');
  });

  it('escapa punto y coma en los campos', () => {
    const csv = generarCsvPostulaciones([
      { estudianteNombre: 'Pérez; Juan', ofertaTitulo: 'Oferta; X', estado: 'PENDIENTE' },
    ]);
    const lineas = csv.split('\n');
    expect(lineas[1]).toBe('Pérez\\; Juan;Oferta\\; X;PENDIENTE');
  });
});
