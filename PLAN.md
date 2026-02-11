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

## 🧱 Persona A: Bloques (Components)

> Crea los bloques reutilizables que cualquier página puede usar.

**Branch:** `feat/blocks`
**Directorio:** `src/components/blocks/`

### Setup inicial
```bash
git clone https://github.com/anju2246/CMS-El-Hub.git
cd CMS-El-Hub
bash scripts/setup.sh
git checkout -b feat/blocks
```

### Tareas paso a paso

#### Día 1 — Bloques esenciales (🔴 Alta prioridad)

- [ ] **Tarea A1: Bloque `hero`**
  - Crear `src/components/blocks/hero.json`
  - Campos:
    - `title` → string, requerido, max 150
    - `subtitle` → text (multilínea)
    - `background_image` → media (single image)
    - `cta_text` → string, max 50 (ej: "Conoce más")
    - `cta_url` → string, max 255
    - `alignment` → enumeration: `left`, `center`, `right` (default: center)
  - Probar: reiniciar Strapi, verificar que aparece como componente

- [ ] **Tarea A2: Bloque `text-block`**
  - Crear `src/components/blocks/text-block.json`
  - Campos:
    - `content` → richtext, requerido
    - `alignment` → enumeration: `left`, `center`, `right` (default: left)
  - Probar: verificar que el editor rich text funciona en el admin

- [ ] **Tarea A3: Bloque `cta`**
  - Crear `src/components/blocks/cta.json`
  - Campos:
    - `heading` → string, max 100
    - `description` → text
    - `button_text` → string, requerido, max 50
    - `button_url` → string, requerido, max 255
    - `style` → enumeration: `primary`, `secondary`, `outline` (default: primary)
  - Probar: verificar en admin

- [ ] **Tarea A4: Commit y push Día 1**
  ```bash
  git add -A && git commit -m "feat: add hero, text-block, cta blocks" && git push origin feat/blocks
  ```

#### Día 2 — Bloques secundarios (🟡 Media prioridad)

- [ ] **Tarea A5: Componente repetible `faq-item`**
  - Crear `src/components/shared/faq-item.json`
  - Campos:
    - `question` → string, requerido, max 200
    - `answer` → richtext, requerido

- [ ] **Tarea A6: Bloque `faq`**
  - Crear `src/components/blocks/faq.json`
  - Campos:
    - `title` → string, max 100 (ej: "Preguntas Frecuentes")
    - `items` → componente repetible `shared.faq-item`, min 1

- [ ] **Tarea A7: Componente repetible `team-member`**
  - Crear `src/components/shared/team-member.json`
  - Campos:
    - `name` → string, requerido, max 100
    - `role` → string, max 100
    - `photo` → media (single image)
    - `linkedin` → string, max 255

- [ ] **Tarea A8: Bloque `team`**
  - Crear `src/components/blocks/team.json`
  - Campos:
    - `title` → string, max 100
    - `members` → componente repetible `shared.team-member`, min 1

- [ ] **Tarea A9: Componente repetible `stat-item`**
  - Crear `src/components/shared/stat-item.json`
  - Campos:
    - `number` → string, max 20 (ej: "500+", "99%")
    - `label` → string, requerido, max 50
    - `icon` → string, max 50 (nombre de ícono)

- [ ] **Tarea A10: Bloque `stats`**
  - Crear `src/components/blocks/stats.json`
  - Campos:
    - `title` → string, max 100
    - `statistics` → componente repetible `shared.stat-item`, min 1

- [ ] **Tarea A11: Bloque `image-grid`**
  - Crear `src/components/blocks/image-grid.json`
  - Campos:
    - `images` → media (multiple)
    - `columns` → enumeration: `2`, `3`, `4` (default: 3)
    - `caption` → string, max 200

- [ ] **Tarea A12: Commit y push Día 2**
  ```bash
  git add -A && git commit -m "feat: add faq, team, stats, image-grid blocks" && git push origin feat/blocks
  ```

#### Día 3 — Bloques opcionales (🟢 Baja prioridad) + Merge

- [ ] **Tarea A13: Bloque `contact-form`**
  - Crear `src/components/blocks/contact-form.json`
  - Campos:
    - `title` → string, max 100
    - `destination_email` → email, requerido
    - `submit_text` → string, default "Enviar"

- [ ] **Tarea A14: Bloque `footer`**
  - Crear `src/components/blocks/footer.json`
  - Campos:
    - `copyright` → string, max 200
    - `social_facebook` → string, max 255
    - `social_instagram` → string, max 255
    - `social_twitter` → string, max 255
    - `social_linkedin` → string, max 255

- [ ] **Tarea A15: Documentar bloques en README**
  - Agregar una sección al README con tabla de todos los bloques, campos y ejemplo JSON de output

- [ ] **Tarea A16: Abrir PR**
  - Abrir Pull Request: `feat/blocks → main`
  - Pedir review a Persona B o C

---

## 🔌 Persona B: Content Types + API

> Arma el sistema de páginas dinámicas y la API que el frontend consume.

**Branch:** `feat/content-types`
**Directorios:** `src/api/`, `config/`

### Setup inicial
```bash
git clone https://github.com/anju2246/CMS-El-Hub.git
cd CMS-El-Hub
bash scripts/setup.sh
git checkout -b feat/content-types
```

### Tareas paso a paso

#### Día 1 — Content Type `page` (🔴 Alta prioridad)

- [ ] **Tarea B1: Crear content type `page`**
  - Crear estructura completa:
    ```
    src/api/page/
    ├── content-types/page/schema.json
    ├── controllers/page.ts
    ├── services/page.ts
    └── routes/page.ts
    ```
  - Schema `page`:
    - `title` → string, requerido, max 200
    - `slug` → uid (basado en title), requerido, único
    - `description` → text, max 500 (para SEO)
    - `ogImage` → media (single image, para redes sociales)
    - `blocks` → dynamiczone (vacío por ahora, se llena cuando Persona A tenga bloques)
  - Controller, service, route: usar `factories` estándar de Strapi
  - Probar: reiniciar Strapi, verificar que "Page" aparece en el admin

- [ ] **Tarea B2: Configurar CORS**
  - Editar `config/middlewares.ts`
  - Agregar configuración para permitir requests del frontend:
    ```typescript
    {
      name: 'strapi::cors',
      config: {
        origin: ['*'],  // En producción cambiar a dominios específicos
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        headers: ['Content-Type', 'Authorization'],
      }
    }
    ```
  - Probar: hacer `curl` desde terminal a la API

- [ ] **Tarea B3: Commit y push Día 1**
  ```bash
  git add -A && git commit -m "feat: add page content type with dynamic zone" && git push origin feat/content-types
  ```

#### Día 2 — Integración de bloques + API (🔴 Alta prioridad)

- [ ] **Tarea B4: Conectar bloques al Dynamic Zone**
  - Una vez que Persona A tenga bloques listos, actualizar `page/schema.json`:
    ```json
    "blocks": {
      "type": "dynamiczone",
      "components": [
        "blocks.hero",
        "blocks.text-block",
        "blocks.cta",
        "blocks.faq",
        "blocks.team",
        "blocks.stats",
        "blocks.image-grid"
      ]
    }
    ```
  - Probar: en el admin, crear una Page y verificar que puedes agregar bloques

- [ ] **Tarea B5: Configurar deep populate**
  - El problema: por defecto Strapi NO devuelve el contenido de los bloques en la API
  - Solución: crear middleware o usar plugin `strapi-plugin-populate-deep`
  - Alternativa: configurar populate personalizado en el controller de page:
    ```typescript
    // src/api/page/controllers/page.ts
    export default factories.createCoreController('api::page.page', ({ strapi }) => ({
      async find(ctx) {
        ctx.query = {
          ...ctx.query,
          populate: {
            blocks: { populate: '*' },
            ogImage: true
          }
        };
        return await super.find(ctx);
      }
    }));
    ```
  - Probar: `curl http://localhost:1337/api/pages` debe devolver bloques con contenido

- [ ] **Tarea B6: Configurar permisos públicos**
  - En el admin: Settings → Users & Permissions → Roles → Public
  - Habilitar `find` y `findOne` para:
    - `page` ✅
    - `navigation` ✅
    - `site-setting` ✅
    - `page-section` ✅
  - Documentar qué permisos se habilitaron

- [ ] **Tarea B7: Commit y push Día 2**
  ```bash
  git add -A && git commit -m "feat: connect blocks to page, configure API populate and permissions" && git push origin feat/content-types
  ```

#### Día 3 — Opcional + Merge (🟡 Media / 🟢 Baja prioridad)

- [ ] **Tarea B8: Content type `blog-post` (opcional)**
  - Solo si el equipo decide que lo necesitan
  - Campos: title, slug, content (richtext), excerpt, cover (media), author, category, publishedAt

- [ ] **Tarea B9: Documentar API en README**
  - Sección "API Endpoints" con:
    - Lista de endpoints disponibles
    - Ejemplo de request y response
    - Filtros útiles (por slug, por estado)

- [ ] **Tarea B10: Abrir PR**
  - Abrir Pull Request: `feat/content-types → main`
  - Pedir review a Persona A o C

---

## ⚙️ Persona C: Infraestructura

> Hace que cualquiera pueda levantar el CMS en 5 minutos y deployar en producción.

**Branch:** `feat/infra`
**Directorios:** `scripts/`, raíz del proyecto

### Setup inicial
```bash
git clone https://github.com/anju2246/CMS-El-Hub.git
cd CMS-El-Hub
bash scripts/setup.sh
git checkout -b feat/infra
```

### Tareas paso a paso

#### Día 1 — Setup y Docker (🔴 Alta prioridad)

- [ ] **Tarea C1: Mejorar `scripts/setup.sh`**
  - Agregar:
    - Detección de OS (macOS vs Linux)
    - Verificar que `node >= 20` está instalado
    - Verificar que `npm` está instalado
    - Preguntar nombre del proyecto (para personalizar package.json)
    - Colores en la terminal (verde ✅, rojo ❌, amarillo ⚠️)
    - Verificar que no hay un `.env` existente (no sobreescribir sin preguntar)
  - Probar: borrar `.env` y correr el script, confirmar que genera todo correctamente

- [ ] **Tarea C2: Crear `Dockerfile`**
  - Multi-stage build:
    ```dockerfile
    # Stage 1: Build
    FROM node:20-alpine AS build
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    RUN npm run build

    # Stage 2: Production
    FROM node:20-alpine AS production
    WORKDIR /app
    COPY --from=build /app ./
    ENV NODE_ENV=production
    EXPOSE 1337
    CMD ["npm", "start"]
    ```
  - Probar: `docker build -t cms-template .` (debe completar sin errores)

- [ ] **Tarea C3: Crear `docker-compose.yml`**
  - Servicios: Strapi + PostgreSQL
    ```yaml
    services:
      cms:
        build: .
        ports:
          - "1337:1337"
        environment:
          DATABASE_CLIENT: postgres
          DATABASE_HOST: db
          DATABASE_PORT: 5432
          DATABASE_NAME: cms
          DATABASE_USERNAME: cms
          DATABASE_PASSWORD: cms_password
        depends_on:
          - db
      db:
        image: postgres:16-alpine
        environment:
          POSTGRES_DB: cms
          POSTGRES_USER: cms
          POSTGRES_PASSWORD: cms_password
        volumes:
          - pgdata:/var/lib/postgresql/data
    volumes:
      pgdata:
    ```
  - Probar: `docker-compose up` → Strapi arranca con PostgreSQL

- [ ] **Tarea C4: Commit y push Día 1**
  ```bash
  git add -A && git commit -m "feat: improve setup script, add Docker support" && git push origin feat/infra
  ```

#### Día 2 — CI/CD y Seed Data (🟡 Media prioridad)

- [ ] **Tarea C5: Crear GitHub Actions CI**
  - Crear `.github/workflows/ci.yml`:
    - Trigger: push a cualquier branch + PRs a main
    - Steps: checkout → setup node 20 → npm ci → npm run build
    - Objetivo: verificar que no hay errores de compilación
  - Probar: hacer push, verificar que el Action corre en GitHub

- [ ] **Tarea C6: Configurar branch protection**
  - En GitHub Settings → Branches → Branch protection rules:
    - Branch: `main`
    - ✅ Require pull request reviews (1 reviewer)
    - ✅ Require status checks to pass (el CI del paso anterior)
  - Puede hacerse via `gh` CLI:
    ```bash
    gh api repos/anju2246/CMS-El-Hub/branches/main/protection -X PUT \
      -f required_pull_request_reviews.required_approving_review_count=1
    ```

- [ ] **Tarea C7: Crear seed data script**
  - Crear `scripts/seed.ts` o `scripts/seed.sh`
  - Debe crear via API de Strapi:
    - 3 navigation items: Inicio, Nosotros, Contacto
    - 5 site-settings: site_name, site_email, site_phone, facebook_url, instagram_url
    - 1 page "Inicio" (si el Dynamic Zone ya está listo)
  - Nota: necesita API token de Strapi. Documentar cómo obtenerlo.
  - Probar: correr script, verificar datos en el admin

- [ ] **Tarea C8: Commit y push Día 2**
  ```bash
  git add -A && git commit -m "feat: add CI, branch protection, seed data" && git push origin feat/infra
  ```

#### Día 3 — Docs + Merge (🟢 Baja prioridad)

- [ ] **Tarea C9: Crear `CONTRIBUTING.md`**
  - Secciones:
    - Cómo hacer fork
    - Cómo crear un nuevo bloque
    - Convención de commits (`feat:`, `fix:`, `docs:`)
    - Cómo abrir un PR
    - Cómo reportar un bug

- [ ] **Tarea C10: Script generador de bloques (opcional)**
  - Crear `scripts/new-block.sh`
  - Uso: `bash scripts/new-block.sh mi-bloque`
  - Genera automáticamente `src/components/blocks/mi-bloque.json` con estructura base

- [ ] **Tarea C11: Abrir PR**
  - Abrir Pull Request: `feat/infra → main`
  - Pedir review a Persona A o B

---

## Cronograma

```
DÍA 1 (100% Paralelo):
  🧱 A → Tareas A1-A4: hero, text-block, cta
  🔌 B → Tareas B1-B3: content type page + CORS
  ⚙️ C → Tareas C1-C4: setup.sh + Docker

DÍA 2 (100% Paralelo):
  🧱 A → Tareas A5-A12: faq, team, stats, image-grid
  🔌 B → Tareas B4-B7: conectar bloques + API populate + permisos
  ⚙️ C → Tareas C5-C8: CI + branch protection + seed data

DÍA 3 (Merge + Docs):
  🧱 A → Tareas A13-A16: contact-form, footer, docs, PR
  🔌 B → Tareas B8-B10: blog-post (opcional), docs, PR
  ⚙️ C → Tareas C9-C11: CONTRIBUTING.md, generador, PR
  TODOS → Code review cruzado → merge a main → test end-to-end
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

## Cómo probar (end-to-end)

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
