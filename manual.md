# Manual del Proyecto: Casas Particulares IA

## Visión General

Aplicación de gestión para empleadas de casas particulares (régimen Ley 26.844, Argentina). Una IA generó el código original y este manual sirve para que otra IA (o un humano) entienda cada módulo y solucione errores.

### Estado actual de los errores reportados

1. **"invalid input syntax for type uuid: \"null\""** — ✅ **FIXADO**. Aparecía en las páginas de Empleadas, Escalas, Cuotas y Feriados.
   - Causa: El adaptador Supabase en `src/lib/storageAdapter.js` tenía una función `uid()` que leía de `localStorage.getItem(\`sb-${DEMO_ID}-auth-token\`)` usando un UUID demo fijo que nunca coincide con la clave real de Supabase (`sb-<project-ref>-auth-token`). Resultado: `uid()` devolvía `null`, y cada consulta `.eq('user_id', null)` enviaba a PostgREST `user_id=eq.null`, que Postgres interpretaba como `WHERE user_id = 'null'::uuid` → error 22P02.
   - Solución: `uid()` ahora usa `supabase.auth.getUser()` (async) y todas las llamadas usan `await uid()`.

2. **"Unexpected Application Error!"** — ✅ **FIXADO**. Aparecía en la página de Licencias.
   - Causa 1: Mismo problema de `uid()` nulo que el anterior (arreglado junto con el fix 1).
   - Causa 2: En `src/features/leaves/hooks.js` línea 19, `setError(err(l) ? l.error : null)` setea el **objeto completo de error de Postgres** (con keys `message`, `details`, `hint`, `code`) en lugar del mensaje string. Al renderizar `{error}` en la página, React intenta renderizar un objeto y lanza "Objects are not valid as a React child", lo cual propaga un error no capturado al nivel del Router, que muestra su errorElement por defecto: "Unexpected Application Error!".
   - Solución: `setError(l.error ? l.error.message : null)`.

3. **HousesPage es un stub** — ❌ **PENDIENTE**. Muestra "x"/"hi" en lugar de la UI real de casas. Parece un placeholder no completado por la IA generadora. El componente se llama `MinHouse` (no `HousesPage`) y está en `src/features/houses/pages/HousesPage.jsx`.

4. **SettingsPage bug** — ✅ **FIXADO**. Usaba `setProfile` y `setSettings` que no estaban disponibles en el scope de la página. Esto provocaría `ReferenceError` al intentar escribir en los formularios.
   - Solución: El hook `useSettings()` (en `src/features/settings/hooks.js`) ahora expone `setSettings` y `setProfile` como setters de estado, y la página los destructura correctamente en línea 6-8.

5. **EmployeeDrawer crash por `employee` undefined** — ✅ **FIXADO (2026-11-14)**. Al abrir `/empleados` sin haber seleccionado una empleada, el drawer se renderizaba de forma incondicional con `employee={undefined}`, y dentro del componente se hacía `useEmployeeContext(employee.id)` → `Cannot read properties of undefined (reading 'id')`.
   - Causa raíz: En `EmployeesPage.jsx` el drawer siempre se montaba, incluso cuando `viewId`/`viewEmp` eran `null`.
   - Soluciones aplicadas:
     - `EmployeesPage.jsx`: el drawer ahora se renderiza solo cuando `emp` es truthy: `{emp && <EmployeeDrawer ... />}`.
     - `EmployeeDrawer.jsx`: defensa adicional respetando el orden de hooks: `useEmployeeContext(employee?.id)` y early-return `if (!open || !employee) return null;`.

---

## Arquitectura General

La app usa:

- **React 18 + React Router v6** (router hash-based).
- **Supabase** como BaaS (autenticación, PostgreSQL, REST API). Si no hay `VITE_SUPABASE_URL/KEY` → modo demo con localStorage.
- **Patrón de adaptadores**: `src/lib/storageAdapter.js` provee dos adaptadores: `supabaseAdapter()` (cuando hay configuración de Supabase) y `localStorageAdapter()` (modo demo con datos de ejemplo).
- **Convención**: el aislamiento de datos por usuario se hace filtrando por `user_id` en TODAS las consultas (la BD no tiene RLS activado).
- **Dominio** (`src/domain/`): lógica de negocio pura (cálculo de escalas, antigüedad, vacaciones, cuotas, settlements).
- **Features** (`src/features/*`): cada módulo de la UI (auth, employees, scales, contributions, holidays, leaves, houses, settlements, dashboard, settings).

---

## Estructura de Archivos

- `index.html` — entrada HTML (`#root`).
- `main.jsx` — ReactDOM.createRoot.
- `router.jsx` — rutas hash con todas las páginas.
- `AppLayout.jsx` — layout con nav + `<Outlet />`.
- `providers.jsx` — `AuthProvider` (sesión/usuario).
- `config.js` — `APP_NAME`, `DEMO_USER`, `CONFIG` (parámetros, escalas, cuotas, feriados).
- `package.json` — deps: react, react-dom, react-router-dom, @supabase/supabase-js, vite.
- `vite.config.js` — plugin React.
- `.env` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- `supabase/schema.sql` — esquema PostgreSQL completo.
- `src/domain/*` — lógica de negocio pura.
- `src/features/*` — módulos UI (api.js, hooks.js, components/, pages/).
- `src/lib/storageAdapter.js` — adaptador Supabase/localStorage.
- `src/lib/format.js` — formateo de moneda/fecha.
- `src/lib/supabaseClient.js` — cliente Supabase.

---

### 6. Leaves / Licencias (`src/features/leaves/`)

- **Propósito**: Registrar licencias (vacaciones, enfermedad, maternidad, especiales). El saldo de vacaciones se calcula con la antigüedad real.
- **`api.js`**: `leavesApi.list()`, `save()`, `remove()`, `vacationBalance(employee, allLeaves)`.
- **`hooks.js`**: `useLeaves()` — carga licencias y lista de empleadas, calcula balance de vacaciones.
- **Componentes**:
  - `LeaveForm.jsx`: formulario con selector empleada, tipo, desde/hasta, días, pagada, notas.
  - `LeaveList.jsx`: tabla con mapeo empleado→nombre, fechas, pagada, acciones.
- **Dominio** (`domain/leaves.js`):
  - `vacationDaysBySeniority(yearsReal)` → 14 <5 años, 21 <10, 28 <20, 35 ≥20.
  - `vacationDaysLeft(yearsReal, leaves)` → total, tomadas, disponibles.
- **Errores**: Antes mostraba "Unexpected Application Error!" (fixado en hooks.js).

### 7. Dashboard (`src/features/dashboard/`)

- **Propósito**: Resumen mensual: empleadas activas, bruto/neto, liquidaciones del mes, alerta escala vieja, bandera SAC.
- **Hook** (`dashboard/api.js`): `dashboardApi.listSettlements()`, `listEmployees()`, `getSalaryScales()`, `getProfile()`.
- **Componente** (`DashboardPage.jsx`): tarjetas resumidas + tabla por empleada con última liquidación.
- **Notable**: ignora errores (no setError) → datos vacíos si falla la consulta.

### 8. Houses (stub)

- **Estado actual**: `src/features/houses/pages/HousesPage.jsx` solo muestra "x"/"hi". Sin listado ni formulario real. Pendiente.

### 9. Settlements / Liquidaciones

- **Propósito**: Liquidación mensual por empleada. Genera `settlement` con inputs y líneas por casa.
- **Wizard** (`liquidar` → `SettlementsWizardPage.jsx`): 3 pasos:
  1. `Step1MonthPicker` — mes + empleada.
  2. `Step2EmployeeCards` — datos por empleada.
  3. `Step3Review` — resumen completo.
- **Dominio** (`domain/payroll.js`): `calculateSettlement(...)` → horas, basico, viaticos, feriado, extras 50/100, antiguedad, zona, ajuste, bruto, aportes, contribuciones, ART, neto y lines.

### 10. Settings (`src/features/settings/`)

- **Propósito**: Parámetros del régimen (divisor, % antigüedad, % zona, recargos, alerta escala, vencimiento cuotas) + datos del empleador.
- **Bug**: La página usa `setProfile()`/`setSettings()` no definidos en su scope (solo dentro del hook). Al escribir → `ReferenceError`.
- **API** (`settingsApi`): `getSettings`, `saveSettings`, `getProfile`, `saveProfile`, `exportData`, `importData`.

### 11. History (`src/features/history/`)

- **Propósito**: Historial de liquidaciones pasadas.
- **Componente** (`HistoryPage.jsx`): listado de liquidaciones por periodo, estado, bruto/neto.
---

## Módulo por Módulo

### 1. Auth (`src/features/auth/`)

- **Propósito**: Registro y login de empleadores. En modo demo cualquier login entra como `DEMO_USER`.
- **`api.js`**: `authApi` (`signIn`, `signUp`, `signOut`, `getSession`, `getProfile`, `saveProfile`) + `translateError()` que traduce mensajes de Supabase a textos amigables en español.
- **`hooks.js`**: `useLogin()` y `useRegister()` → devuelven `{ run, loading, error }`.
- **`pages/LoginPage.jsx`** y **`pages/RegisterPage.jsx`**: páginas simples que renderizan los formularios.
- **`components/LoginForm.jsx`** y **`components/RegisterForm.jsx`**: formularios con validación básica (email, password ≥ 6 caracteres).
- **Relación con providers**: `src/app/providers.jsx` (`AuthProvider`) envuelve toda la app, guarda `session` y `user` en contexto y escucha `adapter.onAuthStateChange`.

### 2. Employees (`src/features/employees/`)

- **Propósito**: CRUD de empleadas. Cada empleada tiene: `nombre`, `cuil`, `fecha_ingreso`, `activo`, `zona_desfavorable`, `notas`, `categoria`, `con_retiro`, `horas_dia`, `dias_semana`, `valor_hora_override`, `valor_mensual_override`.
- **`api.js`**: `employeesApi` con `list`, `save`, `remove`, `getAssignments`, `getSettlements`, `getLeaves`.
- **`hooks.js`**:
  - `useEmployees()` → estado `data`, `loading`, `error`, `save`, `remove`.
  - `useEmployeeContext(employeeId)` → carga assignments, settlements y leaves filtradas por `employee_id`.
- **Componentes**:
  - `EmployeeForm.jsx`: formulario con campos nombre, CUIL, fecha ingreso, categoría (select de `CATEGORIAS`), horas/día, checkboxes (con retiro, zona desfavorable, activa), valor hora/mensual override, notas.
  - `EmployeeList.jsx`: tabla con filtros (buscar nombre/CUIL, categoría, activo/inactivo), ordenar, editar inline, borrar con toast de deshacer.
  - `EmployeeDrawer.jsx`: panel lateral con detalle: CUIL, fecha ingreso, categoría, con retiro, antigüedad (usa `realSeniorityYears`), días de vacaciones (usa `vacationDaysBySeniority`), zona desfavorable, asignaciones, liquidaciones históricas.
  - `EmployeeDetailPage.jsx`: página `/empleados/:id` que renderiza el drawer.
- **Dominio usado**: `realSeniorityYears`, `vacationDaysBySeniority`.

### 3. Scales (`src/features/scales/`)

- **Propósito**: Escalas salariales por categoría y con/sin retiro, con fecha de vigencia. Nunca se sobrescriben valores históricos (se agrega una nueva fila por vigencia).
- **`api.js`**: `scalesApi.list()`, `save()`, `remove()`.
- **`hooks.js`**: `useScales()` con save/remove.
- **Componentes**:
  - `ScaleForm.jsx`: vigenciaDesde (month input), categoría, conRetiro, valorHora, valorMensual, fuente.
  - `ScaleList.jsx`: tabla ordenada por `vigencia_desde` descendente, editar/borrar.
- **Dominio** (`domain/scales.js`): `findScale(scales, { categoria, conRetiro, at, tipo })` → busca la escala vigente a la fecha `at` y devuelve `valor_hora` o `valor_mensual`. `latestScaleDate(scales)` → fecha máxima de vigencia.

### 4. Contributions (`src/features/contributions/`)

- **Propósito**: Cuotas del régimen simplificado por tramo de horas semanales (`hasta12`, `12a16`, `mas16`). Contiene aportes (descuento empleado), contribuciones y ART (costo empleador).
- **`api.js`**: `contributionsApi.list()`, `save()`, `remove()`.
- **`hooks.js`**: `useContributions()`.
- **Componentes**:
  - `ContributionForm.jsx`: vigenciaDesde, tramo (select), aportes, contribuciones, ART, fuente.
  - `ContributionList.jsx`: tabla con labels de tramo, editar/borrar.
- **Dominio** (`domain/contributions.js`):
  - `tramoForHours(hoursWeek)` → devuelve `'hasta12'` / `'12a16'` / `'mas16'`.
  - `contributionForHours(rates, hoursWeek)` → retorna la tasa del tramo vigente.

### 5. Holidays (`src/features/holidays/`)

- **Propósito**: Gestión de feriados argentinos (precargados 2025-2027 desde `CONFIG.holidays`). Permite agregar feriados regionales o no laborables.
- **`api.js`**: `holidaysApi.list()`, `save()`, `remove()`.
- **`hooks.js`**: `useHolidays()`.
- **Componentes**:
  - `HolidayForm.jsx`: fecha (date input), descripción.
  - `HolidayList.jsx`: tabla ordenada por fecha, editar/borrar.
- **Uso interno**: El módulo de settlements usa `holidaysInMonth(period, holidays)` para excluir feriados de días esperados y calcular recargos por feriado trabajado.



## Resumen de cambios aplicados
### Fixes de errores reportados
1. Adaptador Supabase uid() -> supabase.auth.getUser(); 21 llamadas actualizadas a await uid().
2. Leaves hooks: setError ahora recibe el mensaje string del error.
3. Settings: los setters setSettings/setProfile ahora se exponen desde useSettings.

### Fix nuevo (2026-11-14): Crash en /empleados
4. EmployeesPage renderiza el drawer solo si emp existe; EmployeeDrawer usa employee?.id y early return si no hay empleado.

### Commits recientes
- 4724d11 feat: implement demo mode for authentication and enhance error handling in registration and login
- bbb3be7 feat: add gh-pages dependency and improve supabase client configuration
- 5d5b74b feat: app completa de liquidacion de personal casas particulares (Ley 26.844)

Este manual quedo en manual.md en la raiz del proyecto, listo como base para otra IA o consulta humana.
