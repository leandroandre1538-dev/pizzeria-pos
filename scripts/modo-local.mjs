// Arranca el sistema en modo local: sin Supabase, sin Resend, sin configurar nada.
//
//   npm run local
//
// Los datos viven en memoria mientras el servidor este encendido y el resumen
// del dia se guarda como archivo en `correos-locales/`.
//
// Se lanza Next desde Node (y no con "MODO_LOCAL=1 next dev" en package.json)
// para que funcione igual en Windows, Mac y Linux.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const next = require.resolve('next/dist/bin/next');
const puerto = process.env.PORT || '3000';

console.log(`
  Marocchino's POS - modo local
  ------------------------------------------------------------
  Abre en el navegador:   http://localhost:${puerto}
  Desde tu celular:       http://<IP de esta computadora>:${puerto}
                          (misma red wifi)
  Administrador:          usuario admin / clave marocchinos2026

  Los datos se borran al cerrar esta ventana (Ctrl + C).
  ------------------------------------------------------------
`);

const servidor = spawn(process.execPath, [next, 'dev', '-p', puerto, '-H', '0.0.0.0'], {
  stdio: 'inherit',
  env: { ...process.env, MODO_LOCAL: '1', NEXT_PUBLIC_MODO_LOCAL: '1' },
});

servidor.on('exit', (codigo) => process.exit(codigo ?? 0));
