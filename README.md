# Pallets CRM

CRM custom para la operación comercial de pallets plásticos — TYC Argentina.
Stack: **Vite + React + Tailwind + Supabase + Netlify**.

## Estado de datos (pre-cargado en Supabase)

- **48 empresas** con dossiers estratégicos, FOB 12m, marcas importadas, prioridad.
- **255 contactos** con LinkedIn, seniority, flag de decisor (94 decisores, 109 alta prioridad).
- 5 empresas críticas: Eramine, Tsingshan, Electrofueguina, Toyota, Livent/Arcadium.

## Estructura

```
src/
├── main.jsx              # entry + BrowserRouter
├── App.jsx               # rutas + AuthProvider
├── index.css             # tailwind + tokens
├── lib/
│   ├── supabase.js       # cliente
│   ├── constants.js      # enums → labels ES
│   └── utils.js          # fmtUSD, fmtDate, wa.me normalizer
├── hooks/
│   └── useAuth.jsx
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

## Setup local

```bash
npm install
cp .env.example .env
# las variables ya están rellenas con el proyecto Supabase `pallets-crm`
npm run dev
# → http://localhost:5173
```

Antes de loguear, creá el usuario en Supabase Studio:
**Authentication → Users → Add user** → email + password.

---

## Deploy en GitHub + Netlify (flujo recomendado)

### 1) Subir a GitHub (repo **privado**)

```bash
# Desde la carpeta del proyecto
git init
git add .
git commit -m "Initial commit: pallets-crm MVP"
git branch -M main
```

Creá el repo en https://github.com/new:
- Nombre: `pallets-crm`
- Visibility: **Private**
- **No** tildes ninguna opción de "Initialize" (el repo tiene que estar vacío)
- Create repository

Seguí las instrucciones que da GitHub para "push an existing repository":

```bash
git remote add origin https://github.com/TU_USUARIO/pallets-crm.git
git push -u origin main
```

Si GitHub te pide autenticación con HTTPS y no tenés token, usá SSH:
```bash
git remote set-url origin git@github.com:TU_USUARIO/pallets-crm.git
git push -u origin main
```

### 2) Conectar a Netlify

1. Ir a https://app.netlify.com/start
2. **Import from Git** → **GitHub**
3. Autorizar Netlify para acceder a tus repos. Como el repo es privado, vas a tener que:
   - "Configure the Netlify app on GitHub"
   - Seleccionar "Only select repositories" → elegir `pallets-crm`
   - Guardar
4. Volvé a Netlify, buscá `pallets-crm` en la lista.
5. **Build settings** (autodetecta por `netlify.toml`, confirmá):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **Environment variables** — antes del primer deploy agregá:
   ```
   VITE_SUPABASE_URL=https://vtrhzchlslycqrvbbzwv.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_hKjEizE5fpkUkfSwW3YcPA_CDuHRQPO
   ```
   Si no las agregás, el build compila pero la app tira error al abrir.
7. Click **Deploy site**.

Netlify te asigna un dominio tipo `https://random-name.netlify.app`.
Podés renombrarlo en **Site settings → Change site name** → `pallets-crm` (si está disponible).

### 3) CI automático

Ya queda configurado: cada `git push origin main` → deploy automático.
Para cambios chicos: editás en GitHub web → commit → Netlify deploya en 1-2 min.

### 4) (Opcional) Dominio custom

Settings → Domain management → Add custom domain. Netlify emite certificado Let's Encrypt automáticamente.

---

## Tablas Supabase (ya migradas)

- `companies` — empresas con dossier, FOB, clasificación, prioridad
- `contacts` — contactos con LinkedIn, seniority, es_decisor
- `imports_history` — registros de aduana (pendiente carga)
- `interactions` — log cronológico de interacciones
- `tasks` — tareas asignables
- `message_templates` — plantillas reutilizables

Vistas: `companies_with_stats`, `contacts_full`.

---

## Roadmap corto

- [ ] Cargar tabla `imports_history` desde `importadores.xlsx`
- [ ] Editar empresa/contacto directamente desde UI (hoy read-only)
- [ ] Plantillas de mensajes (tabla `message_templates`) con variables
- [ ] Integración WhatsApp/Gmail vía MCP
- [ ] Exportar vista de empresas a CSV
- [ ] Añadir dark mode (opcional)

---

## Claves del proyecto

- **Supabase project**: `pallets-crm` (`vtrhzchlslycqrvbbzwv`, sa-east-1)
- **Dashboard**: https://supabase.com/dashboard/project/vtrhzchlslycqrvbbzwv
