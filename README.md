# Marocchino's Pizzeria — Sistema de Caja

Sistema de pedidos, gastos y cierre de caja para la pizzeria.
Lo usa la **cajera** durante el turno; el **dueño** recibe un correo con el
resumen del dia a las 00:05 (hora de Peru).

Todo el stack es gratuito: **Vercel** (hosting + cron), **Supabase** (base de
datos) y **Resend** (correo).

---

## 0. Probarlo en tu computadora, sin configurar nada

No necesitas Supabase, Resend ni Vercel para verlo funcionar. El **modo local**
guarda todo en memoria y ya trae la carta completa cargada.

1. Instala **Node.js 20 o superior** desde [nodejs.org](https://nodejs.org)
   (la version LTS). Es la unica instalacion.
2. Descomprime el proyecto y abre una terminal dentro de la carpeta
   `marocchinos-pos`.
3. Instala las dependencias (solo la primera vez, tarda un par de minutos):

   ```bash
   npm install
   ```

4. Arranca el sistema:

   ```bash
   npm run local
   ```

5. Abre **http://localhost:3000** en el navegador.
   - **Cajera:** un clic, sin clave.
   - **Administrador:** usuario `admin`, clave `marocchinos2026`.

**Para verlo en tu celular:** conecta el celular al mismo wifi que la
computadora y abre `http://<IP-de-tu-computadora>:3000`. La IP la ves con
`ipconfig` en Windows (linea "Direccion IPv4") o `ifconfig` en Mac/Linux.
Si no carga, Windows puede pedirte permitir Node.js en el firewall.

**Que tener en cuenta del modo local:**

- Arriba aparece una cinta amarilla que dice *Modo local*, para no confundirlo
  con el sistema real.
- Los datos se borran al cerrar la terminal (`Ctrl + C`). Cada vez que lo
  arrancas empiezas con la carta limpia y sin pedidos.
- El boton **Enviar por correo** del resumen no envia nada: guarda el correo
  como archivo en la carpeta `correos-locales/`. Abrelo con doble clic para ver
  exactamente lo que recibiria el dueno.
- Es para probar. Para trabajar de verdad, sigue la seccion 1.

---

## 1. Puesta en marcha (30 minutos, una sola vez)

### Paso 1 — Crear la base de datos en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. **New project**. Ponle de nombre `marocchinos`, elige una region cercana
   (South America) y guarda bien la contraseña que te genera.
3. Cuando termine de crearse, ve a **SQL Editor → New query**.
4. Copia **todo** el contenido de `supabase/01_schema.sql`, pegalo y dale **Run**.
5. Abre otra query nueva, copia **todo** `supabase/02_carta_inicial.sql`,
   pegalo y dale **Run**. Esto carga la carta completa, los adicionales y tres
   promociones de ejemplo.
6. Ve a **Project Settings → API** y copia dos datos:
   - **Project URL** → sera `SUPABASE_URL`
   - **service_role** (en *Project API keys*, dale a *Reveal*) → sera
     `SUPABASE_SERVICE_ROLE_KEY`

> La clave `service_role` es secreta. Nunca la pongas en el navegador ni la
> compartas: solo va en las variables de entorno de Vercel.

### Paso 2 — Crear la cuenta de correo en Resend

1. Entra a [resend.com](https://resend.com) y crea una cuenta gratuita
   (3.000 correos al mes, mas que suficiente para uno diario).
2. Ve a **API Keys → Create API Key** y copia la clave (`re_...`).
3. Para empezar puedes enviar desde `onboarding@resend.dev` sin configurar nada.
   Si mas adelante quieres que llegue desde tu propio dominio, agregalo en
   **Domains**.

### Paso 3 — Subir el proyecto a Vercel

1. Sube esta carpeta a un repositorio de GitHub (puede ser privado).
2. Entra a [vercel.com](https://vercel.com), **Add New → Project**, e importa
   ese repositorio.
3. Antes de dar *Deploy*, abre **Environment Variables** y agrega estas seis:

   | Variable | Valor |
   |---|---|
   | `SUPABASE_URL` | La *Project URL* de Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | La clave *service_role* de Supabase |
   | `RESEND_API_KEY` | La clave de Resend (`re_...`) |
   | `CORREO_REMITENTE` | `Marocchinos POS <onboarding@resend.dev>` |
   | `CORREO_DUENO` | El correo del dueño (varios separados por coma) |
   | `CRON_SECRET` | Una clave larga inventada, ej: `mrc-9f2k-x71p-2026` |
   | `SESSION_SECRET` | Otra clave larga inventada, distinta a la anterior |

4. **Deploy**. En un par de minutos tendras la direccion
   `https://marocchinos.vercel.app` (o la que te asigne).

El cron del resumen diario queda configurado solo: ya esta declarado en
`vercel.json` y se ejecuta todos los dias a las 05:05 UTC, que son las
**00:05 en Peru**.

### Paso 4 — Primer ingreso

Entra a la direccion y elige **Administrador**:

- usuario: `admin`
- clave: `marocchinos2026`

**Lo primero que debes hacer es cambiar esa clave** desde *Usuarios →
Cambiar clave*.

---

## 2. Como se usa

### La cajera

Entra y toca **Cajera**. No necesita clave. Tiene cuatro pantallas:

- **Nuevo pedido** — busca la pizza (o filtra por categoria) y toca la tarjeta,
  en cualquier parte. Cada tarjeta muestra un solo precio, el de la presentacion
  familiar; dentro se elige Personal, Compartida o Familiar, la cantidad, los
  adicionales (queso extra, tocino...), la nota para la cocina y, si hace falta,
  **un precio distinto**. Va sumando productos y al final toca *Cobrar*: ahi
  elige el tipo (delivery o local), la promocion si aplica y la forma de pago
  (efectivo, Yape, Plin o mixto).
- **Pedidos del dia** — todo lo vendido hoy, con el detalle de cada pedido y
  la opcion de anular uno mal tomado.
- **Gastos** — cada salida de dinero del dia, con su categoria y como se pago.
  Los gastos en efectivo se descuentan automaticamente del cuadre.
- **Cierre de caja** — al terminar el turno: dinero encontrado al inicio y al
  final, cuantas masas quedaron, si dejo harina y cuanta, y las observaciones
  del dia. La pantalla le dice en vivo si la caja **cuadra** o cuanto falta o
  sobra.

### Pensado para el celular

La caja se usa desde el telefono. Por eso los botones tienen el tamano de un
dedo, los campos de monto abren el teclado numerico, las ventanas salen desde
abajo como en cualquier app, y el pedido en curso es una barra delgada arriba
que se despliega al tocarla. En la carta, cada producto es una tarjeta entera
tocable con un precio discreto a la derecha, sin centimos cuando no los tiene
(las bebidas de medio litro si los muestran, porque cuestan S/ 3.50). Los
adicionales de una pizza aparecen solo al tocar "Adicionales". Los iconos son de
[Lucide](https://lucide.dev) (`lucide-react`).

### El dueño

Entra con usuario y clave. Ve lo mismo que la cajera mas:

- **Resumen del dia** — puede consultar cualquier fecha y reenviarse el correo
  cuando quiera.
- **Carta y precios** — cambia un precio escribiendo el numero nuevo; se aplica
  al instante en caja. Tambien puede agregar productos, ocultarlos o borrarlos.
- **Promociones** — crea promociones con **fecha de inicio y fin**. Para una
  promo de un solo dia, pone la misma fecha en ambos campos. Opcionalmente
  puede limitarla a ciertos dias de la semana (solo martes, solo fines de
  semana) y exigir un monto minimo de pedido.
- **Adicionales** — los ingredientes extra y sus precios.
- **Usuarios** — crear mas administradores o cambiar claves.

### El correo de medianoche

A las 00:05 llega al correo del dueño un resumen con:

pizzas vendidas (con el detalle por tipo y presentacion) · masas que quedaron ·
si dejo harina y cuanta · dinero al inicio del dia · dinero al final ·
si la caja cuadro · efectivo, Yape y Plin por separado · gastos del dia ·
utilidad aproximada · observaciones de la cajera · y un aviso si se editaron
precios a mano.

---

## 3. Arquitectura

El proyecto sigue **arquitectura hexagonal** (puertos y adaptadores). La regla
que sostiene todo es que **las dependencias apuntan hacia adentro**: el dominio
no sabe que existen Supabase, Resend ni Next.js.

```
src/
├── dominio/            Reglas del negocio. Sin dependencias externas.
│   ├── valores/        Dinero, FechaOperativa, FormasDePago, TipoProducto...
│   ├── entidades/      Pedido, LineaPedido, Promocion, Gasto, CierreCaja
│   ├── promociones/    Politicas de descuento (Strategy)
│   └── servicios/      ArqueoDeCaja, ResumenDiario
│
├── aplicacion/         Que puede hacer el sistema.
│   ├── puertos/        Contratos hacia afuera (repositorios, correo, reloj)
│   └── casos-uso/      Un archivo = una operacion del negocio
│
├── infraestructura/    Adaptadores concretos.
│   ├── supabase/       Repositorios sobre Supabase (produccion)
│   ├── memoria/        Los mismos repositorios en memoria (npm run local)
│   ├── filas/          Traduccion fila <-> entidad, compartida por ambos
│   ├── correo/         Envio con Resend + armado del HTML
│   ├── seguridad/      Hash de claves y firma de sesion
│   ├── http/           Sesion, respuestas y presentadores
│   ├── AdaptadoresDeSalida.js  Elige Supabase o memoria segun el modo
│   └── Contenedor.js   Aqui se conecta todo (inyeccion de dependencias)
│
├── app/                Next.js: paginas y rutas HTTP (adaptadores de entrada)
└── components/         Interfaz de usuario
```

### Que gana el negocio con esto

- **El dinero nunca se redondea mal.** `Dinero` guarda centimos enteros, asi que
  no existen los errores de decimales que hacen que un arqueo no cuadre por un
  centavo.
- **Las reglas estan en un solo lugar.** El calculo de un pedido, la vigencia de
  una promocion y el cuadre de caja viven en el dominio y se prueban solos, sin
  base de datos. Son 48 pruebas que corren en un par de segundos.
- **Agregar una promocion nueva no rompe nada.** Un "2x1" o un "delivery gratis"
  se agrega como una politica mas en `PoliticasDeDescuento.js`; ni las entidades
  ni los casos de uso ni las rutas cambian.
- **Cambiar de proveedor es barato.** Si mañana Supabase deja de convenir, se
  escribe un adaptador nuevo que cumpla el mismo puerto y el negocio no se entera.
  El modo local es la prueba: es otro juego de adaptadores (en memoria) y
  ninguna regla de negocio tuvo que cambiar para soportarlo.
- **Los precios no se pueden falsear desde el navegador.** Aunque la cajera puede
  editar un precio, el total siempre se recalcula en el servidor y el precio
  original de la carta queda guardado junto al editado para que el dueño lo vea.

### Pruebas

```bash
npm test
```

Cubren las reglas de dominio (calculo de pedidos, pagos mixtos, vigencia de
promociones, arqueo de caja, resumen diario) y el modo local de punta a punta:
un dia completo con los casos de uso reales sobre la memoria. Una de ellas
compara la carta del modo local con `supabase/02_carta_inicial.sql`, asi que
si un precio cambia en un lado y no en el otro, la prueba avisa.

---

## 4. Desarrollo local

```bash
npm install
cp .env.example .env.local   # y completa los valores
npm run dev                  # http://localhost:3000
```

Para probar el correo del resumen sin esperar a medianoche:

```
https://TU-DOMINIO.vercel.app/api/cron/resumen-diario?clave=TU_CRON_SECRET&fecha=2026-09-19
```

---

## 5. Cosas que conviene saber

- **La carta ya viene cargada** con las 16 pizzas, los 11 combos, pan al ajo,
  bebidas, jugos y mojitos. Los frappes no estan incluidos porque ya no se venden.
- **Los pedidos anulados no se borran**, quedan marcados. Asi el dueño ve si se
  anularon muchos.
- **La sesion de la cajera dura 16 horas**, para que cubra un turno completo sin
  volver a entrar.
- **El plan gratuito de Vercel permite un cron al dia**, que es exactamente lo
  que necesita el resumen.
- **Supabase gratuito pausa el proyecto tras una semana sin actividad.** Con uso
  diario no pasa, pero si cierran por vacaciones hay que reactivarlo desde el
  panel.
