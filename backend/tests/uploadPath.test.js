import { describe, expect, it } from 'vitest';
const { resolveStoredUpload, safeDownloadName } = require('../src/utils/uploadPath');

describe('resolveStoredUpload', () => {
  it('resuelve archivos dentro de la carpeta autorizada', () => {
    const result = resolveStoredUpload('cvs/hoja-vida.pdf', 'cvs');

    expect(result).toMatch(/[\\/]uploads[\\/]cvs[\\/]hoja-vida\.pdf$/);
  });

  it('rechaza traversal fuera de la carpeta autorizada', () => {
    expect(resolveStoredUpload('../fotos/avatar.png', 'cvs')).toBeNull();
    expect(resolveStoredUpload('cvs/../../.env', 'cvs')).toBeNull();
  });

  it('rechaza rutas vacias o con tipo invalido', () => {
    expect(resolveStoredUpload('', 'cvs')).toBeNull();
    expect(resolveStoredUpload(null, 'cvs')).toBeNull();
  });

  it('limpia nombres usados en la cabecera de descarga', () => {
    expect(safeDownloadName('../cv"\r\n.pdf', 'hoja.pdf')).toBe('cv___.pdf');
    expect(safeDownloadName('hoja de vida', 'hoja.pdf')).toBe('hoja de vida.pdf');
    expect(safeDownloadName('', 'hoja.pdf')).toBe('hoja.pdf');
  });
});
