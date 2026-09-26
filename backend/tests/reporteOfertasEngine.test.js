import { describe, it, expect } from 'vitest';
import {
  calcularEstadisticasOfertas,
  generarCsvOfertas,
} from '../src/services/reporteOfertasEngine';

const ofertas = [
  { estadoVigencia: 'ACTIVA', tipoOportunidad: 'PRACTICA', dependenciaNombre: 'Sistemas', titulo: 'Oferta A' },
  { estadoVigencia: 'ACTIVA', tipoOportunidad: 'PRACTICA', dependenciaNombre: 'Sistemas', titulo: 'Oferta B' },
  { estadoVigencia: 'ACTIVA', tipoOportunidad: 'SERVICIO_SOCIAL', dependenciaNombre: 'Biblioteca', titulo: 'Oferta C' },
  { estadoVigencia: 'INACTIVA', tipoOportunidad: 'PRACTICA', dependenciaNombre: 'Sistemas', titulo: 'Oferta D' },
  { estadoVigencia: 'CERRADA', tipoOportunidad: 'SERVICIO_SOCIAL', dependenciaNombre: 'Biblioteca', titulo: 'Oferta E' },
  { estadoVigencia: 'VENCIDA', tipoOportunidad: 'PRACTICA', dependenciaNombre: 'Deportes', titulo: 'Oferta F' },
];

describe('calcularEstadisticasOfertas — agregaciones puras (TDD fase 3)', () => {
  it('calcula el total de ofertas', () => {
    const stats = calcularEstadisticasOfertas(ofertas);
    expect(stats.total).toBe(6);
  });

  it('cuenta ofertas por estado de vigencia', () => {
    const stats = calcularEstadisticasOfertas(ofertas);
    expect(stats.porEstado).toEqual({
      ACTIVA: 3,
      INACTIVA: 1,
      CERRADA: 1,
      VENCIDA: 1,
    });
  });

  it('cuenta ofertas por tipo de oportunidad', () => {
    const stats = calcularEstadisticasOfertas(ofertas);
    expect(stats.porTipo).toEqual({
      PRACTICA: 4,
      SERVICIO_SOCIAL: 2,
    });
  });

  it('cuenta ofertas por dependencia', () => {
    const stats = calcularEstadisticasOfertas(ofertas);
    expect(stats.porDependencia).toEqual({
      Sistemas: 3,
      Biblioteca: 2,
      Deportes: 1,
    });
  });

  it('incluye lista de dependencias ordenada por cantidad descendente', () => {
    const stats = calcularEstadisticasOfertas(ofertas);
    expect(stats.dependenciasOrdenadas).toEqual([
      { nombre: 'Sistemas', cantidad: 3 },
      { nombre: 'Biblioteca', cantidad: 2 },
      { nombre: 'Deportes', cantidad: 1 },
    ]);
  });

  it('maneja lista vacía sin errores', () => {
    const stats = calcularEstadisticasOfertas([]);
    expect(stats.total).toBe(0);
    expect(stats.porEstado).toEqual({});
    expect(stats.porTipo).toEqual({});
    expect(stats.porDependencia).toEqual({});
    expect(stats.dependenciasOrdenadas).toEqual([]);
  });

  it('maneja ofertas sin dependencia asignada', () => {
    const stats = calcularEstadisticasOfertas([
      { estadoVigencia: 'ACTIVA', tipoOportunidad: 'PRACTICA', dependenciaNombre: '', titulo: 'X' },
      { estadoVigencia: 'ACTIVA', tipoOportunidad: 'PRACTICA', dependenciaNombre: 'Sistemas', titulo: 'Y' },
    ]);
    expect(stats.porDependencia['Sin dependencia']).toBe(1);
    expect(stats.porDependencia['Sistemas']).toBe(1);
  });

  it('normaliza estado/tipo vacío a "Sin datos"', () => {
    const stats = calcularEstadisticasOfertas([
      { estadoVigencia: '', tipoOportunidad: null, dependenciaNombre: 'X', titulo: 'Z' },
    ]);
    expect(stats.porEstado['Sin datos']).toBe(1);
    expect(stats.porTipo['Sin datos']).toBe(1);
  });
});

describe('generarCsvOfertas — exportación CSV pura (TDD fase 3)', () => {
  it('genera CSV con encabezados correctos', () => {
    const csv = generarCsvOfertas(ofertas);
    const lineas = csv.split('\n');
    expect(lineas[0]).toBe('Titulo;Estado;Tipo;Dependencia');
  });

  it('genera una fila por oferta', () => {
    const csv = generarCsvOfertas(ofertas);
    const lineas = csv.split('\n');
    expect(lineas.length).toBe(7); // 1 header + 6 datos
  });

  it('genera CSV con datos separados por punto y coma', () => {
    const csv = generarCsvOfertas(ofertas);
    const lineas = csv.split('\n');
    expect(lineas[1]).toBe('Oferta A;ACTIVA;PRACTICA;Sistemas');
    expect(lineas[4]).toBe('Oferta D;INACTIVA;PRACTICA;Sistemas');
  });

  it('genera solo encabezado con lista vacía', () => {
    const csv = generarCsvOfertas([]);
    expect(csv).toBe('Titulo;Estado;Tipo;Dependencia');
  });

  it('escapa punto y coma en los campos', () => {
    const csv = generarCsvOfertas([
      { titulo: 'Oferta; con punto', estadoVigencia: 'ACTIVA', tipoOportunidad: 'PRACTICA', dependenciaNombre: 'Dep;1' },
    ]);
    const lineas = csv.split('\n');
    expect(lineas[1]).toBe('Oferta\\; con punto;ACTIVA;PRACTICA;Dep\\;1');
  });
});
