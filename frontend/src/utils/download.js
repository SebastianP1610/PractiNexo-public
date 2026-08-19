export function descargarBlob(blob, nombreArchivo) {
  const nombreSeguro = String(nombreArchivo || 'descarga.pdf')
    .split(/[\\/]/)
    .pop()
    .replace(/[^a-zA-Z0-9._ -]/g, '_')
    .slice(0, 120) || 'descarga.pdf';
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = nombreSeguro.toLowerCase().endsWith('.pdf')
    ? nombreSeguro
    : `${nombreSeguro}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
