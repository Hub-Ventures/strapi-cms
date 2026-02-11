# 🏗️ Plan de Implementación — CMS Template

**Repo:** [github.com/anju2246/CMS-El-Hub](https://github.com/anju2246/CMS-El-Hub)
**Stack:** Strapi v5 · TypeScript · SQLite (dev) / PostgreSQL (prod)
**Equipo:** 3 personas

---

## Arquitectura

El CMS usa **Dynamic Zones** para que cada website arme sus páginas con bloques reutilizables:

```
CMS Template
├── Components (bloques)     ← 🧱 Piezas de contenido reutilizables
│   ├── hero
│   ├── text-block
│   ├── image-grid
│   ├── cta
│   ├── faq
│   ├── team
│   ├── stats
│   ├── contact-form
│   └── footer
│
├── Content Types (API)      ← 🔌 Endpoints que el frontend consume
│   ├── page (Dynamic Zone → usa los bloques)
│   ├── page-section
│   ├── site-setting
│   └── navigation
│
└── Infraestructura          ← ⚙️ Setup, deploy, CI/CD
    ├── scripts/setup.sh
    ├── seed data
    ├── Dockerfile
    └── docs
```

El frontend de cada proyecto hace fetch a `/api/pages?filters[slug]=inicio` y recibe los bloques con su contenido. Cada website renderiza los bloques con sus propios componentes visuales.

---

## Roles y Tareas

### 🧱 Persona A: Bloques (Components)

> Crea los bloques reutilizables que cualquier página puede usar.

**Branch:** `feat/blocks`
**Directorio:** `src/components/blocks/`

| Bloque | Campos | Prioridad |
|--------|--------|-----------|
| `hero` | título, subtítulo, imagen (media), botón CTA (text + url), alineación | 🔴 Alta |
| `text-block` | contenido (richtext), alineación (enum: left/center/right) | 🔴 Alta |
| `cta` | texto, url, estilo (enum: primary/secondary/outline), ícono | 🔴 Alta |
| `image-grid` | imágenes (media[]), columnas (2/3/4), caption | 🟡 Media |
| `faq` | items (componente repetible: pregunta + respuesta) | 🟡 Media |
| `team` | miembros (componente repetible: nombre, rol, foto, linkedin) | 🟡 Media |
| `stats` | estadísticas (componente repetible: número, label, ícono) | 🟡 Media |
| `contact-form` | email_destino, título, campos (componente repetible: label, tipo, requerido) | 🟢 Baja |
| `footer` | columnas (componente repetible: título, links[]), copyright, redes sociales | 🟢 Baja |

**Entregables:**
- [ ] Archivos `src/components/blocks/*.json` para cada bloque
- [ ] Componentes repetibles auxiliares (ej: `faq-item`, `team-member`, `stat-item`)
- [ ] Documentar cada bloque en el README (campos + ejemplo de output JSON)

---

### 🔌 Persona B: Content Types + API

> Arma el sistema de páginas dinámicas y la API que el frontend consume.

**Branch:** `feat/content-types`
**Directorio:** `src/api/`, `config/`

| Tarea | Detalle | Prioridad |
|-------|---------|-----------|
| Content type `page` | slug (unique), title, description (SEO), ogImage, `blocks` (Dynamic Zone) | 🔴 Alta |
| Conectar bloques al Dynamic Zone | Registrar cada bloque de Persona A en el Dynamic Zone de `page` | 🔴 Alta |
| Configurar API populate | Que `/api/pages?populate=deep` devuelva bloques con todo su contenido | 🔴 Alta |
| Permisos públicos | Configurar RBAC: `find` y `findOne` públicos para page, navigation, site-setting | 🟡 Media |
| CORS | Permitir requests desde cualquier frontend (o dominios específicos) | 🟡 Media |
| Content type `blog-post` (opcional) | title, slug, content, author, category, cover, publishedAt | 🟢 Baja |

**Entregables:**
- [ ] `src/api/page/` completo con schema + Dynamic Zone
- [ ] API funcional: `/api/pages`, `/api/pages/:id`, filtros por slug
- [ ] Permisos configurados en `config/`
- [ ] Documentar endpoints en el README

**Dependencia:** Necesita al menos 3 bloques de Persona A para conectar al Dynamic Zone. Puede arrancar con la estructura del `page` content type mientras espera.

---

### ⚙️ Persona C: Infraestructura

> Hace que cualquiera pueda levantar el CMS en 5 minutos y deployar en producción.

**Branch:** `feat/infra`
**Directorios:** `scripts/`, raíz del proyecto

| Tarea | Detalle | Prioridad |
|-------|---------|-----------|
| Mejorar `setup.sh` | Validar prereqs, generar secrets, detectar OS, colores | 🔴 Alta |
| Seed data | Script que crea una página "Inicio" de ejemplo con bloques | 🔴 Alta |
| `Dockerfile` | Multi-stage build para producción | 🟡 Media |
| `docker-compose.yml` | Strapi + PostgreSQL para deploy local | 🟡 Media |
| GitHub Actions CI | Lint + build en cada PR | 🟡 Media |
| Branch protection | Proteger `main`, requerir 1 review en PRs | 🟡 Media |
| `CONTRIBUTING.md` | Guía de cómo contribuir, convenciones de código | 🟢 Baja |
| Script generador | `scripts/new-block.sh hero` genera la estructura de un bloque nuevo | 🟢 Baja |

**Entregables:**
- [ ] `scripts/setup.sh` mejorado
- [ ] `scripts/seed.sh` o `scripts/seed.ts` con datos de ejemplo
- [ ] `Dockerfile` + `docker-compose.yml`
- [ ] `.github/workflows/ci.yml`
- [ ] `CONTRIBUTING.md`

**Sin dependencias** — puede trabajar desde el día 1.

---

## Cronograma

```
DÍA 1 (Paralelo):
  🧱 A → hero, text-block, cta (los 3 esenciales)
  🔌 B → content type page (estructura + Dynamic Zone vacío)
  ⚙️ C → setup.sh mejorado + Dockerfile

DÍA 2 (Paralelo):
  🧱 A → image-grid, faq, team
  🔌 B → conectar bloques al Dynamic Zone + permisos + populate
  ⚙️ C → seed data + docker-compose + CI

DÍA 3 (Merge):
  Todos → PR a main, code review cruzado
  Test → levantar de cero, crear página, verificar API
```

---

## Git Workflow

```bash
# Cada persona:
git checkout -b feat/mi-area
# ... trabaja ...
git add -A && git commit -m "feat: descripción"
git push origin feat/mi-area
# Abre PR en GitHub → alguien revisa → merge a main
```

**Reglas:**
- Nunca push directo a `main`
- PRs necesitan 1 aprobación
- Commits descriptivos: `feat: add hero block`, `fix: cors config`

---

## Cómo probar

```bash
# 1. Clonar y setup
git clone https://github.com/anju2246/CMS-El-Hub.git
cd CMS-El-Hub
bash scripts/setup.sh

# 2. Levantar
npm run develop

# 3. Abrir admin
# http://localhost:1337/admin → crear usuario

# 4. Probar API
curl http://localhost:1337/api/pages
curl http://localhost:1337/api/navigations
curl http://localhost:1337/api/site-settings
```
