# Casas Particulares IA

App web modular y escalable para la liquidación mensual de personal de casas particulares (Argentina, Ley 26.844). Reemplaza el Excel de liquidación con un cálculo trazable, editable y congelable por mes.

## Stack
- React 18 + Vite + react-router-dom (**HashRouter**, funciona en GitHub Pages sin hacks de 404).
- Bootstrap 5.3 por CDN + variables CSS propias (paleta coherente, sin gris default).
- Sin librería de estado global: **Context + custom hooks**. Cada feature expone sus propios servicios de API.
- **Supabase** como BaaS: Auth email/password + Postgres. `supabase-js` v2 maneja sesión, JWT y refresh automáticamente.
- **SIN políticas RLS y SIN RPCs**: el aislamiento de datos se hace filtrando por `user_id` en TODAS las consultas desde los servicios de API.
- **Persistencia dual con un único contrato de adaptador**: si existen `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` se usa el adaptador Supabase; si no, se usa **localStorage** con banner "Modo demo" y datos seed (Tatiana, Jesica, Graciela) para que gh-pages abra poblada y usable. Export/import JSON en ambos modos.
- Deploy: GitHub Pages vía GitHub Actions con las env vars como Secrets del repo. `vite.config.js` con `base: '/casas-particulares-ia/'`.

## Estructura de carpetas
```
casas-particulares-ia/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── supabase/
│   └── schema.sql
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── main.jsx
│   ├── config.js                 # escalas, cuotas, feriados 2025-2027 y parámetros por defecto (referencia)
│   ├── app/                      # router.jsx (HashRouter), providers.jsx (Auth), AppLayout.jsx
│   ├── lib/                      # supabaseClient.js, storageAdapter.js (dual), format.js (es-AR)
│   ├── domain/                   # funciones puras: payroll, calendar, seniority, vacations, scales, contributions
│   ├── components/ui/            # Toast, EmptyState, MoneyInput
│   └── features/
│       ├── auth/                 # login, registro, auth simulada en demo
│       ├── houses/               # CRUD casas laborales
│       ├── employees/            # CRUD empleadas + drawer detalle + saldo vacaciones
│       ├── settlements/          # wizard liquidar mes (3 pasos) + detalle con recibo imprimible
│       ├── history/              # historial, filtros, comparativa, libro sueldos CSV
│       ├── scales/               # editor de escalas versionadas por mes de vigencia
│       ├── contributions/        # editor de cuotas aporte/contribución/ART por tramo
│       ├── holidays/             # ABM feriados (precargados 2025-2027)
│       ├── leaves/               # licencias (vacaciones/enfermedad/maternidad/especial)
│       ├── dashboard/            # KPIs, tarjetas por empleada, alertas, botón liquidar
│       └── settings/             # parámetros, datos empleador, export/import JSON
```

## Datos seed (modo demo) — verificación manual
Mes: agosto/2025, 26 días laborales (L a S). Feriado cargado: 17/08.

**Tatiana** — tareas generales, con retiro, L a S, 3 hs/día, 26 días trabajados:
- 78 hs × $6.000 = básico $468.000
- Viáticos: $1.489 × 2 (ida/vuelta) × 26 = $77.428
- Subtotal hs + viáticos = $545.428
- Feriado 17/08 TRABAJADO: +100% del día (3 hs × $6.000) = +$18.000
- **TOTAL (bruto) = $563.428**

**Jesica** — tareas generales, con retiro, L-J-V, 3 hs/día, 12 días trabajados:
- 36 hs × $4.500 = básico $162.000
- Viáticos: $1.486 × 2 × 12 = $35.664
- Subtotal = $197.664. Feriado 17/08 NO trabajado: +$0
- **TOTAL (bruto) = $197.664**

**Graciela** — asistencia y cuidado de personas, con retiro, L a V 6 hs/día (30 hs/semana) → mensualizada proporcional.

El modo demo incluye la liquidación cerrada de referencia de Tatiana (agosto/2025) para verificar el detalle línea por línea.

## Primeros pasos (modo demo local)
```bash
npm install
npm run dev      # abre en http://localhost:5173
```
Sin variables de entorno, arranca en **Modo demo** (localStorage) con datos de ejemplo. El login acepta cualquier usuario/contraseña (demo/demo).
## Configurar Supabase (producción)
1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Ejecutá `supabase/schema.sql` en el SQL Editor del proyecto (crea tablas, índices, uniques y triggers `updated_at`. **SIN RLS ni RPCs**).
3. En Supabase → Authentication → Settings, habilitá **Email authentications**.
4. Copiá **Project URL** y **anon public key**.
5. Creá un archivo `.env` en la raíz:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
6. Volvé a correr `npm run dev`. La app usará Supabase y el banner "Modo demo" desaparecerá.

## Deploy a GitHub Pages
1. Subí el código a un repositorio llamado `casas-particulares-ia` (o ajustá `base` en `vite.config.js`).
2. En GitHub → Settings → Secrets and variables → Actions, agregá:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Habilitá GitHub Pages en Settings → Pages (fuente: GitHub Actions).
4. Pusheá a `main`. El workflow `.github/workflows/deploy.yml` buildéa y despliega.
5. La app queda en `https://<usuario>.github.io/casas-particulares-ia/`.

## Exportar / Importar JSON
Desde **Ajustes**:
- **Exportar todo a JSON**: descarga un respaldo con empleadas, casas, asignaciones, escalas, cuotas, feriados, liquidaciones, licencias y ajustes.
- **Importar JSON**: reemplaza los datos actuales con los del archivo JSON (útil para migrar de modo demo a Supabase o hacer respaldos).

## Advertencia de seguridad (SIN RLS)
Este proyecto se entrega **sin políticas RLS y sin RPCs** por decisión de alcance. El aislamiento de datos se realiza únicamente filtrando por `user_id` en la capa de API del frontend.

> Esto **no es seguridad real multiusuario**: cualquier persona con acceso a la base de datos (o que intecepte la `anon_key` expuesta en el frontend) podría leer/escribir datos de todos los usuarios.

Si querés activar seguridad real más adelante:
1. En Supabase → SQL Editor, habilitá RLS en cada tabla: `alter table <tabla> enable row level security;`
2. Creá políticas que filtren por `auth.uid() = user_id`, por ejemplo:
   ```sql
   create policy employees_own on employees
     for all using (auth.uid() = user_id);
   ```
3. Repetí para todas las tablas (`houses`, `assignments`, `salary_scales`, `contribution_rates`, `holidays`, `settlements`, `settlement_lines`, `leaves`, `settings`, `profiles`).
4. Considerá usar una **service role key** desde un backend (RPC/Edge Function) en lugar de la `anon_key` directamente desde el navegador.

## Supuestos y decisiones de diseño
1. Se omiten tests automatizados (vitest) por instrucción explícita.
2. Las escalas y cuotas de `config.js` son **referencia no oficial**, marcadas con fecha y fuente; deben verificarse en ARCA/CNT Casas Particulares antes de usarse en producción.
3. El cálculo de antigüedad aplica 1% del básico por año cumplido, computado desde `max(fecha_ingreso, 2020-09-01)` y solo en períodos `>= 2021-09-01`.
4. En modo demo la sesión es simulada y los datos persisten en `localStorage` del navegador (no sobreviven al limpiar datos del sitio).
5. `vite.config.js` usa `base: '/casas-particulares-ia/'`; si cambias el nombre del repo, ajustá este valor.
