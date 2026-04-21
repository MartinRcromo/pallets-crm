# Pallets CRM — Contexto para Claude Code

## Qué es este proyecto

CRM B2B custom para la operación comercial de pallets plásticos de TYC Argentina (grupo Cromosol). Va a ser usado por un vendedor "hunter" que entra en las próximas semanas + el owner (Martín) que supervisa.

**Dos roles, un sistema:**
- **Hunter** (2-4h/día): abre la app, ve qué hacer hoy, ejecuta touches (LinkedIn/WhatsApp/email/llamadas), registra interacciones, crea tareas de follow-up
- **Owner** (15min/día + review semanal): ve el pipeline, detecta leads fríos, mide actividad del hunter

**Datos cargados:** 48 empresas con dossier estratégico + 255 contactos con LinkedIn. Prioridad va de `baja` → `media` → `alta` → `critica`. 5 empresas críticas: Eramine, Toyota, Tsingshan, Electrofueguina, Livent/Arcadium.

---

## Stack

- **Frontend:** Vite 6 + React 18 + React Router 6 (JS, sin TypeScript)
- **Estilos:** Tailwind CSS con paleta custom (NO usar shadcn/ui todavía)
- **Backend:** Supabase (Postgres 17 + Auth + RLS) — proyecto `pallets-crm`, ref `vtrhzchlslycqrvbbzwv`, región sa-east-1
- **Deploy:** Netlify con CI automático desde GitHub (push a `main` → deploy)
- **Iconos:** `lucide-react`
- **Markdown:** `react-markdown` (para renderizar dossiers)
- **Fechas:** `date-fns` con locale `es`

**NO agregar dependencias sin preguntar.** Si algo se puede resolver con lo que ya hay, preferilo.

---

## Reglas de diseño

Dirección: **editorial-industrial sobrio**. No es una SPA "genérica React". Tiene personalidad.

**Paleta (ya definida en `tailwind.config.js`, usala siempre):**
- `paper` (#FAFAF7) — fondo principal, crema
- `ink` (#1A1817) — texto principal, casi negro
- `rust` (50-900) — acento rojizo/terracota para prioridad crítica, CTAs principales
- Neutrales: usar `zinc-*` de Tailwind

**Tipografía:**
- Serif (IBM Plex Serif): títulos (`font-serif`), headings grandes. Uso editorial.
- Sans (IBM Plex Sans): body text (default, `font-sans`)
- Mono (IBM Plex Mono): labels pequeñas, timestamps, números tabulares (`font-mono tabular-nums`). Uso frecuente en uppercase + tracking-widest para "etiquetas industriales".

**Componentes existentes a reutilizar (en `src/components/ui/Badges.jsx`):**
`PrioridadBadge`, `ClasifBadge`, `EstadoRelacionBadge`, `PrioContactoBadge`, `EstadoContactoBadge`, `SectorChip`, `SeniorityChip`, `DecisorPill`.

**Botones (clases definidas en `src/index.css`):** `.btn-primary` (ink), `.btn-secondary` (borde), `.btn-ghost`, `.btn-rust` (rojo — para acciones primarias importantes). Input: `.input`. Card: `.card`.

**Animaciones:** `animate-fade-in` y `animate-slide-up` para entradas. No overdo.

**Evitar:**
- Emojis (excepto si existen ya en el código)
- Purple gradients
- Fonts genéricas (NUNCA Inter, Roboto, system-ui)
- Bordes redondeados excesivos (`rounded-lg` max, casi nunca `rounded-xl`)

---

## Supabase — lo que necesitás saber

**Credenciales en `.env` (Netlify ya las tiene configuradas, no las cambies):**
```
VITE_SUPABASE_URL=https://vtrhzchlslycqrvbbzwv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_hKjEizE5fpkUkfSwW3YcPA_CDuHRQPO
```

**Cliente ya configurado en `src/lib/supabase.js`:**
```js
import { supabase } from '@/lib/supabase'  // ajustar path relativo
```

### Schema actual (tablas en `public`)

**`companies`** — columnas principales:
- `id` (uuid), `razon_social`, `nombre_comercial`, `cuit`
- `sector`, `subsector`
- `clasificacion` enum: `usuario_final | revendedor | competidor | excluido | por_clasificar`
- `prioridad_comercial` enum: `critica | alta | media | baja`
- `estado_relacion` enum: `sin_contacto | contactado | conversando | propuesta_enviada | negociando | cliente | perdido | en_pausa`
- `dossier_estrategico` (text, markdown), `nota_prioridad`, `gap_producto`
- `fob_usd_12m`, `operaciones_12m`, `principales_marcas_importadas` (text[]), `principales_origenes` (text[])
- `sitio_web`, `linkedin_url`, `ciudad`, `provincia`, `direccion`
- `owner_id` (fk auth.users), `created_at`, `updated_at`

**`contacts`:**
- `id` (uuid), `company_id` (fk)
- `nombre`, `apellido`, `nombre_completo` (generated: `nombre || ' ' || apellido`)
- `cargo`, `area`
- `seniority` enum: `director | head | gerente | manager | jefe | coordinador | supervisor | responsable | especialista | senior | analista | comprador | otro`
- `es_decisor` (bool)
- `prioridad` enum: `alta | media_alta | media | baja`
- `estado` enum: `por_contactar | contactado | respondio | reunion_agendada | no_responde | descartado`
- `linkedin_url`, `email`, `telefono`, `whatsapp`, `ubicacion`, `notas`

**`interactions`:**
- `company_id`, `contact_id`, `tipo` enum (`email|telefono|whatsapp|reunion_presencial|reunion_virtual|linkedin_mensaje|linkedin_conexion|visita_planta|otro`)
- `direccion` (`saliente|entrante`), `fecha`, `resumen`, `sentiment` (`positivo|neutral|negativo|no_aplica`)
- `proximo_paso`, `duracion_minutos`, `realizada_por` (fk auth.users)

**`tasks`:**
- `company_id`, `contact_id`, `titulo`, `descripcion`, `due_date`, `prioridad`
- `completada` (bool), `completada_at`, `asignada_a` (fk auth.users)

**`message_templates`** (tabla existe, está vacía — plan futuro):
- `nombre`, `canal`, `asunto`, `cuerpo`, `idioma`, `variables` (text[])

**Vistas:**
- `companies_with_stats` — incluye `contactos_total`, `contactos_alta`, `interacciones_total`, `ultima_interaccion`, `tasks_pendientes`
- `contacts_full` — join con empresa + última interacción

### RLS
Todas las tablas tienen RLS habilitado con policies abiertas a `authenticated`. Cualquier usuario logueado puede leer/escribir todo. No intentar refactorizar esto sin aviso.

---

## Estructura del código

```
src/
├── main.jsx              # entry + BrowserRouter
├── App.jsx               # rutas + AuthProvider
├── index.css             # tailwind + clases utilitarias (.btn-*, .input, .card, .prose-dossier)
├── lib/
│   ├── supabase.js       # cliente
│   ├── constants.js      # enums → labels ES
│   └── utils.js          # fmtUSD, fmtDate, timeAgo, cn, toWhatsappNumber
├── hooks/
│   └── useAuth.jsx       # AuthProvider + useAuth()
├── components/
│   ├── Layout.jsx        # topbar + bottom-nav mobile
│   ├── AuthGuard.jsx
│   ├── InteraccionForm.jsx
│   └── ui/Badges.jsx
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── Empresas.jsx
    ├── EmpresaDetalle.jsx   # 5 tabs: Dossier · Importaciones · Contactos · Interacciones · Tareas
    ├── ContactoDetalle.jsx  # botones rápidos WhatsApp/Email/LinkedIn/Tel
    └── Tareas.jsx
```

---

## Convenciones de código

1. **JS, no TypeScript.** No introducir TS.
2. **Componentes funcionales** con hooks. Nada de class components.
3. **Imports absolutos o relativos:** usar relativos (`../lib/utils`). No configurar alias `@/` a menos que pidan.
4. **Naming:** `PascalCase` para componentes, `camelCase` para todo lo demás. Snake_case SOLO para columnas Postgres (tal cual vienen).
5. **Nunca** usar `localStorage` o `sessionStorage` directamente por ahora. Supabase maneja la sesión.
6. **Errors:** mostrar con un `<div className="rounded border border-red-200 bg-red-50 text-red-800 ...">` inline. No hay sistema de toasts todavía.
7. **Loading states:** texto simple en mono uppercase tipo `"cargando…"` o spinner sutil. No skeletons genéricos.
8. **Fechas en UI:** usar helpers de `lib/utils.js` (`fmtDate`, `fmtDateTime`, `timeAgo`).
9. **WhatsApp links:** usar `toWhatsappNumber()` para normalizar el número (default +54 AR) y `encodeURIComponent` para el texto.

---

## Cómo entregar

1. **Trabajá en branch dedicado por sprint.** Nombre: `sprint-N-descripcion` (ej: `sprint-1-hunter-ready`).
2. **Commits chicos y atómicos.** Un commit por feature lógica. Mensajes en español, imperativo corto: `"feat: editar estado_relacion desde empresa detalle"`.
3. **Antes de commitear, ALWAYS:** `npm run build` local — si no buildea, no commitees.
4. **Al final del sprint, crear PR a `main`.** Título: `Sprint N: <nombre corto>`. Body con checklist de features + screenshots si cambió UI.
5. **NO pushear a `main` directo.** Siempre vía PR para que Martín pueda revisar.
6. **Si tenés dudas de scope o diseño, preguntá en vez de asumir.**

---

## Definición de "hecho"

Una tarea del sprint está hecha cuando:

1. ✅ Funciona en local (`npm run dev` + prueba manual con datos reales de Supabase)
2. ✅ `npm run build` pasa sin errores ni warnings nuevos
3. ✅ Responsive: funciona bien en mobile (375px ancho) y desktop
4. ✅ Estado de loading, error y empty cubiertos
5. ✅ No rompe funcionalidad previa (smoke test de las otras páginas)
6. ✅ Código consistente con el estilo del resto del proyecto

---

## Fuera de alcance (por ahora)

- TypeScript
- Testing automatizado (Jest, Vitest)
- shadcn/ui (evaluaremos más adelante)
- Realtime/subscripciones Supabase
- Multi-idioma
- Dark mode
- Integraciones externas (Gmail, WhatsApp API, etc.)

Si creés que algo de esto aporta mucho valor al sprint actual, proponelo ANTES de implementarlo.
