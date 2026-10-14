// Corredor de pruebas: compila cada archivo de pruebas con esbuild y lo ejecuta en Node.
// Se usa esbuild solo para resolver el alias "@/" y los imports sin extension.
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const archivos = ['dominio.prueba.js', 'memoria.prueba.js'];

for (const archivo of archivos) {
  const salida = path.join(raiz, 'node_modules', '.cache-pruebas', archivo.replace('.js', '.mjs'));

  await build({
    entryPoints: [path.join(raiz, 'pruebas', archivo)],
    bundle: true,
    platform: 'node',
    format: 'esm',
    // Las librerias se cargan desde node_modules; solo se empaqueta el codigo propio.
    packages: 'external',
    target: 'node20',
    outfile: salida,
    logLevel: 'error',
    alias: { '@': path.join(raiz, 'src') },
  });

  execFileSync(process.execPath, [salida], { stdio: 'inherit', cwd: raiz });
}
