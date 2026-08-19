import { describe, it, expect } from 'vitest';
import {
  normalizarTexto,
  tokenizar,
  sinAcentos,
  keywordsCoinciden,
  calcularCoincidenciaTexto,
  calcularCoincidenciaKeywords,
  evaluarCoincidencia,
} from '../src/services/matchingEngine';

describe('sinAcentos', () => {
  it('elimina acentos del texto', () => {
    expect(sinAcentos('ingeniería informática')).toBe('ingenieria informatica');
  });

  it('no modifica texto sin acentos', () => {
    expect(sinAcentos('ingenieria sistemas')).toBe('ingenieria sistemas');
  });
});

describe('normalizarTexto', () => {
  it('normaliza a minusculas, trim y sin acentos', () => {
    expect(normalizarTexto('  Ingeniería de Sistemas  ')).toBe('ingenieria de sistemas');
  });

  it('retorna string vacio para null/undefined', () => {
    expect(normalizarTexto(null)).toBe('');
    expect(normalizarTexto(undefined)).toBe('');
    expect(normalizarTexto('')).toBe('');
  });

  it('convierte numero a string', () => {
    expect(normalizarTexto(123)).toBe('123');
  });
});

describe('keywordsCoinciden', () => {
  it('retorna true para palabras identicas', () => {
    expect(keywordsCoinciden('node', 'node')).toBe(true);
  });

  it('retorna true si una contiene a la otra (3+ chars)', () => {
    expect(keywordsCoinciden('api', 'api rest')).toBe(true);
    expect(keywordsCoinciden('backend', 'back')).toBe(true);
  });

  it('retorna false para palabras sin relacion', () => {
    expect(keywordsCoinciden('node', 'react')).toBe(false);
  });

  it('retorna false si una tiene menos de 3 caracteres', () => {
    expect(keywordsCoinciden('ok', 'okay')).toBe(false);
  });
});

describe('tokenizar', () => {
  it('separa palabras y quita stop words y acentos', () => {
    const tokens = tokenizar('Ingeniería de Sistemas');
    expect(tokens).not.toContain('de');
    expect(tokens).toContain('ingenieria');
    expect(tokens).toContain('sistemas');
  });

  it('retorna array vacio para texto solo con stop words', () => {
    expect(tokenizar('de la el')).toEqual([]);
  });

  it('retorna array vacio para string vacio', () => {
    expect(tokenizar('')).toEqual([]);
  });
});

describe('calcularCoincidenciaTexto', () => {
  it('retorna 1 para texto identico con acentos', () => {
    expect(calcularCoincidenciaTexto('Ingeniería de Sistemas', 'Ingeniería de Sistemas')).toBe(1);
  });

  it('retorna 1 para texto sin acentos que es semanticamente igual', () => {
    expect(calcularCoincidenciaTexto('Ingeniería Informática', 'Ingenieria Informatica')).toBe(1);
  });

  it('retorna > 0 para textos con palabras en comun', () => {
    const r = calcularCoincidenciaTexto('Ingeniería de Sistemas', 'Ingeniería Informática');
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThan(1);
  });

  it('retorna 0 para textos sin palabras en comun', () => {
    expect(calcularCoincidenciaTexto('Medicina', 'Ingeniería Civil')).toBe(0);
  });

  it('retorna 0 para valores vacios', () => {
    expect(calcularCoincidenciaTexto('', 'Ingeniería')).toBe(0);
    expect(calcularCoincidenciaTexto(null, 'Ingeniería')).toBe(0);
    expect(calcularCoincidenciaTexto('Ingeniería', undefined)).toBe(0);
  });
});

describe('calcularCoincidenciaKeywords', () => {
  it('usa Math.min(perfil, referencia) como denominador', () => {
    const r = calcularCoincidenciaKeywords(
      ['node', 'react', 'python'],
      ['node', 'react', 'mongodb'],
    );
    expect(r).toBeCloseTo(2 / Math.min(3, 3));
  });

  it('no penaliza por tener mas skills que la oferta', () => {
    const r = calcularCoincidenciaKeywords(
      ['node', 'react', 'python', 'java', 'go', 'rust', 'c'],
      ['node', 'react'],
    );
    expect(r).toBe(1);
  });

  it('retorna 1 cuando todas las del perfil estan en referencia', () => {
    expect(calcularCoincidenciaKeywords(
      ['node', 'react'],
      ['node', 'react', 'mongodb'],
    )).toBe(1);
  });

  it('retorna 0 cuando ninguna coincide', () => {
    expect(calcularCoincidenciaKeywords(
      ['python', 'java'],
      ['node', 'react'],
    )).toBe(0);
  });

  it('retorna 0 si perfil no tiene keywords', () => {
    expect(calcularCoincidenciaKeywords([], ['node'])).toBe(0);
    expect(calcularCoincidenciaKeywords(null, ['node'])).toBe(0);
  });

  it('retorna 0 si referencia no tiene keywords', () => {
    expect(calcularCoincidenciaKeywords(['node'], [])).toBe(0);
    expect(calcularCoincidenciaKeywords(['node'], null)).toBe(0);
  });

  it('ignora mayusculas/minusculas, espacios y acentos', () => {
    const r = calcularCoincidenciaKeywords(['  Node.js  ', 'React'], ['node.js', ' react ']);
    expect(r).toBe(1);
  });

  it('coincide parcialmente cuando una palabra contiene a la otra', () => {
    const r = calcularCoincidenciaKeywords(
      ['api', 'backend'],
      ['api rest', 'back'],
    );
    expect(r).toBeCloseTo(1);
  });
});

describe('evaluarCoincidencia', () => {
  function crearPerfil(opciones = {}) {
    return {
      programaAcademico: opciones.programaAcademico ?? 'Ingeniería de Sistemas',
      areaInteres: opciones.areaInteres ?? 'Desarrollo de Software',
      tipoOportunidadInteres: opciones.tipoOportunidadInteres ?? 'PRACTICA',
      disponibilidad: opciones.disponibilidad ?? 'Medio Tiempo',
      palabrasClave: opciones.palabrasClave ?? ['node', 'react', 'javascript', 'mongodb'],
      habilidades: opciones.habilidades ?? [],
    };
  }

  function crearOferta(opciones = {}) {
    return {
      programaAcademico: opciones.programaAcademico ?? 'Ingeniería de Sistemas',
      areaInteres: opciones.areaInteres ?? 'Desarrollo de Software',
      tipoOportunidad: opciones.tipoOportunidad ?? 'PRACTICA',
      disponibilidad: opciones.disponibilidad ?? 'Medio Tiempo',
      palabrasClave: opciones.palabrasClave ?? ['node', 'react', 'mongodb'],
      requisitos: opciones.requisitos ?? ['node', 'express', 'mongodb'],
    };
  }

  it('retorna 100 cuando todos los criterios coinciden', () => {
    const perfil = crearPerfil({ palabrasClave: ['node', 'mongodb'] });
    const oferta = crearOferta({
      palabrasClave: ['node', 'mongodb', 'react'],
      requisitos: ['node', 'mongodb', 'express'],
    });
    const resultado = evaluarCoincidencia(perfil, oferta);

    expect(resultado.puntajeCoincidencia).toBe(100);
    expect(resultado.criteriosCoincidentes).toContain('programaAcademico');
    expect(resultado.criteriosCoincidentes).toContain('areaInteres');
    expect(resultado.criteriosCoincidentes).toContain('tipoOportunidad');
    expect(resultado.criteriosCoincidentes).toContain('disponibilidad');
    expect(resultado.criteriosCoincidentes).toContain('palabrasClave');
    expect(resultado.criteriosCoincidentes).toContain('requisitos');
    expect(resultado.criteriosCoincidentes.length).toBe(6);
  });

  it('25+25+20+5 = 75 cuando no hay keywords', () => {
    const perfil = crearPerfil({ palabrasClave: [] });
    const oferta = crearOferta({ palabrasClave: ['node'], requisitos: ['java'] });
    const resultado = evaluarCoincidencia(perfil, oferta);
    expect(resultado.puntajeCoincidencia).toBe(75);
    expect(resultado.criteriosCoincidentes).not.toContain('palabrasClave');
    expect(resultado.criteriosCoincidentes).not.toContain('requisitos');
  });

  it('retorna 0 cuando no hay ninguna coincidencia', () => {
    const perfil = crearPerfil({
      programaAcademico: 'Medicina',
      areaInteres: 'Pediatría',
      tipoOportunidadInteres: 'SERVICIO_SOCIAL',
      disponibilidad: 'Tiempo Completo',
      palabrasClave: ['python', 'django'],
    });
    const oferta = crearOferta({
      programaAcademico: 'Ingeniería Civil',
      areaInteres: 'Construcción',
      tipoOportunidad: 'PRACTICA',
      disponibilidad: 'Medio Tiempo',
      palabrasClave: ['node', 'react'],
      requisitos: ['java', 'spring'],
    });
    const resultado = evaluarCoincidencia(perfil, oferta);
    expect(resultado.puntajeCoincidencia).toBe(0);
    expect(resultado.criteriosCoincidentes).toEqual([]);
  });

  it('coincidencia parcial de programa academico da puntaje proporcional', () => {
    const resultado = evaluarCoincidencia(
      crearPerfil({ programaAcademico: 'Ingeniería de Sistemas' }),
      crearOferta({ programaAcademico: 'Ingeniería Informática' }),
    );
    expect(resultado.criteriosCoincidentes).toContain('programaAcademico');
  });

  it('coincidencia parcial de area de interes da puntaje proporcional', () => {
    const resultado = evaluarCoincidencia(
      crearPerfil({ areaInteres: 'Desarrollo Web' }),
      crearOferta({ areaInteres: 'Desarrollo de Software' }),
    );
    expect(resultado.criteriosCoincidentes).toContain('areaInteres');
  });

  it('disponibilidad diferente no suma puntos', () => {
    const resultado = evaluarCoincidencia(
      crearPerfil({ disponibilidad: 'Medio Tiempo' }),
      crearOferta({ disponibilidad: 'Tiempo Completo' }),
    );
    expect(resultado.criteriosCoincidentes).not.toContain('disponibilidad');
  });

  it('tipo de oportunidad diferente no suma puntos', () => {
    const resultado = evaluarCoincidencia(
      crearPerfil({ tipoOportunidadInteres: 'PRACTICA' }),
      crearOferta({ tipoOportunidad: 'SERVICIO_SOCIAL' }),
    );
    expect(resultado.criteriosCoincidentes).not.toContain('tipoOportunidad');
  });

  it('habilidades y palabrasClave se unifican para matching', () => {
    const resultado = evaluarCoincidencia(
      crearPerfil({ palabrasClave: ['express'], habilidades: ['node', 'react'] }),
      crearOferta({ palabrasClave: ['node', 'react', 'mongodb'], requisitos: ['express'] }),
    );
    expect(resultado.criteriosCoincidentes).toContain('palabrasClave');
    expect(resultado.criteriosCoincidentes).toContain('requisitos');
  });

  it('puntaje nunca excede 100', () => {
    const resultado = evaluarCoincidencia(crearPerfil(), crearOferta());
    expect(resultado.puntajeCoincidencia).toBeLessThanOrEqual(100);
  });

  it('maneja oferta con campos nulos sin lanzar error', () => {
    const resultado = evaluarCoincidencia(crearPerfil(), {});
    expect(resultado.puntajeCoincidencia).toBe(0);
    expect(resultado.criteriosCoincidentes).toEqual([]);
  });

  it('maneja perfil con campos nulos sin lanzar error', () => {
    const resultado = evaluarCoincidencia({}, crearOferta());
    expect(resultado.puntajeCoincidencia).toBe(0);
    expect(resultado.criteriosCoincidentes).toEqual([]);
  });

  it('string identico en programa sin stop words da 20pts', () => {
    const resultado = evaluarCoincidencia(
      crearPerfil({ programaAcademico: 'Medicina' }),
      crearOferta({ programaAcademico: 'Medicina' }),
    );
    expect(resultado.criteriosCoincidentes).toContain('programaAcademico');
  });

  it('coincidencia parcial de keywords da puntaje proporcional', () => {
    const perfil = crearPerfil({ palabrasClave: ['node', 'python', 'java'] });
    const oferta = crearOferta({ requisitos: ['express'], palabrasClave: ['node', 'python', 'react'] });
    const resultado = evaluarCoincidencia(perfil, oferta);
    expect(resultado.puntajeCoincidencia).toBeGreaterThan(75);
    expect(resultado.puntajeCoincidencia).toBeLessThan(100);
  });

  it('disponibilidad identica suma 5 puntos', () => {
    const resultadoSinDisp = evaluarCoincidencia(
      crearPerfil({ disponibilidad: 'Medio Tiempo' }),
      crearOferta({ disponibilidad: 'Completo' }),
    );
    const resultadoConDisp = evaluarCoincidencia(
      crearPerfil({ disponibilidad: 'Medio Tiempo' }),
      crearOferta({ disponibilidad: 'Medio Tiempo' }),
    );
    expect(resultadoConDisp.puntajeCoincidencia - resultadoSinDisp.puntajeCoincidencia).toBe(5);
  });

  it('retorna criteriosCoincidentes vacio cuando puntaje es 0', () => {
    const resultado = evaluarCoincidencia({}, {});
    expect(resultado.criteriosCoincidentes).toEqual([]);
    expect(resultado.puntajeCoincidencia).toBe(0);
  });

  describe('detalles', () => {
    it('incluye detalles con palabras coincidentes en programaAcademico', () => {
      const resultado = evaluarCoincidencia(
        crearPerfil({ programaAcademico: 'Ingeniería de Sistemas' }),
        crearOferta({ programaAcademico: 'Ingeniería Informática' }),
      );
      expect(resultado.detalles.programaAcademico).toBeDefined();
      expect(resultado.detalles.programaAcademico.coinciden).toContain('ingenieria');
      expect(resultado.detalles.programaAcademico.palabrasPerfil).toContain('sistemas');
      expect(resultado.detalles.programaAcademico.palabrasOferta).toContain('informatica');
    });

    it('incluye detalles con palabras coincidentes en areaInteres', () => {
      const resultado = evaluarCoincidencia(
        crearPerfil({ areaInteres: 'Desarrollo Web' }),
        crearOferta({ areaInteres: 'Desarrollo de Software' }),
      );
      expect(resultado.detalles.areaInteres).toBeDefined();
      expect(resultado.detalles.areaInteres.coinciden).toContain('desarrollo');
    });

    it('incluye detalles con valor en tipoOportunidad', () => {
      const resultado = evaluarCoincidencia(
        crearPerfil({ tipoOportunidadInteres: 'PRACTICA' }),
        crearOferta({ tipoOportunidad: 'PRACTICA' }),
      );
      expect(resultado.detalles.tipoOportunidad).toBeDefined();
      expect(resultado.detalles.tipoOportunidad.valor).toBe('practica');
    });

    it('incluye detalles con keywords coincidentes en palabrasClave', () => {
      const resultado = evaluarCoincidencia(
        crearPerfil({ palabrasClave: ['node', 'react', 'python'] }),
        crearOferta({ palabrasClave: ['node', 'react', 'mongodb'] }),
      );
      expect(resultado.detalles.palabrasClave).toBeDefined();
      expect(resultado.detalles.palabrasClave.coinciden).toEqual(['node', 'react']);
    });

    it('incluye detalles con keywords coincidentes en requisitos', () => {
      const resultado = evaluarCoincidencia(
        crearPerfil({ palabrasClave: ['node', 'express', 'mongodb'] }),
        crearOferta({ requisitos: ['node', 'express', 'mongodb'] }),
      );
      expect(resultado.detalles.requisitos).toBeDefined();
      expect(resultado.detalles.requisitos.coinciden).toContain('node');
      expect(resultado.detalles.requisitos.coinciden).toContain('express');
    });

    it('unifica palabrasClave y habilidades en palabrasClave detalles', () => {
      const resultado = evaluarCoincidencia(
        crearPerfil({ palabrasClave: ['api'], habilidades: ['node', 'react'] }),
        crearOferta({ palabrasClave: ['react'], requisitos: ['api'] }),
      );
      expect(resultado.detalles.palabrasClave).toBeDefined();
      expect(resultado.detalles.palabrasClave.palabrasPerfil).toContain('node');
      expect(resultado.detalles.palabrasClave.palabrasPerfil).toContain('api');
      expect(resultado.detalles.palabrasClave.coinciden).toContain('react');
      expect(resultado.detalles.requisitos.coinciden).toContain('api');
    });

    it('incluye detalles con valor en disponibilidad', () => {
      const resultado = evaluarCoincidencia(
        crearPerfil({ disponibilidad: 'Medio Tiempo' }),
        crearOferta({ disponibilidad: 'Medio Tiempo' }),
      );
      expect(resultado.detalles.disponibilidad).toBeDefined();
      expect(resultado.detalles.disponibilidad.valor).toBe('medio tiempo');
    });

    it('detalles es objeto vacio cuando no hay coincidencias', () => {
      const resultado = evaluarCoincidencia({}, {});
      expect(resultado.detalles).toEqual({});
    });
  });
});
