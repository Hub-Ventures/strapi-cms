# CMS Template

Plantilla reutilizable de CMS basada en **Strapi v5**. Fork este repo para crear el CMS de cualquier proyecto web.

## Relación con upstream

Este repo es una **aplicación Strapi** (template de proyecto). El upstream de referencia para convenciones de despliegue y scripts es [Hub-Ventures/strapi](https://github.com/Hub-Ventures/strapi/tree/develop) (fork del core de Strapi). Este proyecto mantiene alineado:

- **Scripts**: `build`, `develop`, `start`, `deploy` — mismos que en `examples/empty` del upstream.
- **Producción**: `npm run build` → arranque con `node app.js` o `strapi start`; nunca `strapi develop` en producción.
- **Variables de entorno**: `NODE_ENV`, `HOST`, `PORT`, `URL`, `APP_KEYS`, `DATABASE_*` — mismas que en la documentación y ejemplos del core.
- **Base de datos**: Por defecto PostgreSQL (puerto 5432); opcionalmente MySQL vía `DATABASE_CLIENT=mysql`.
- **Docker**: `docker-compose.dev.yml` ofrece Postgres y MySQL para desarrollo local, alineado con el upstream.

## Inicio rápido

```bash
# 1. Fork o clona este repositorio
git clone https://github.com/tu-org/cms-template.git cms-mi-proyecto
cd cms-mi-proyecto

# 2. Ejecuta el setup (genera secrets + instala dependencias)
bash scripts/setup.sh

# 3. Inicia Strapi en modo desarrollo
npm run develop

# 4. Abre http://localhost:1337/admin y crea tu usuario admin
```

## Despliegue (alineado con upstream)

Flujo estándar en producción (igual que en el core y ejemplos):

1. **Build**: `npm run build` (genera `dist/`).
2. **Arranque**: `npm run start` (`strapi start`) o **startup file** `app.js` para entornos que exigen un archivo de entrada (p. ej. Plesk/Passenger).

No usar `strapi develop` en producción.

### Opción A: Plesk (Passenger)

- Application root: p. ej. `/cms`
- Startup file: `app.js`
- Node.js: `>=20`
- Base de datos: PostgreSQL (puerto 5432)

```bash
npm install
# Configura .env con NODE_ENV=production, URL, DATABASE_*, APP_KEYS, etc.
npm run build
```

En Plesk: define el startup file como `app.js` y reinicia la app.

### Opción B: Servidor genérico (PM2, systemd, etc.)

```bash
npm install
npm run build
npm run start
# o: node app.js
```

### Variables de entorno en producción

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
URL=https://cms.tu-dominio.com
APP_KEYS=key1,key2
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...
ENCRYPTION_KEY=...
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=tu_bd
DATABASE_USERNAME=tu_usuario
DATABASE_PASSWORD=tu_password
```

El `app.js` del repo ya está configurado (`distDir: ./dist`, `appDir: __dirname`); no hace falta sustituirlo.

## Content Types incluidos

### 🔵 Core (siempre activos)

| Content Type | Descripción | Campos clave |
|-------------|-------------|-------------|
| **Page Section** | Secciones editables de cualquier página | `page`, `section`, `content` (JSON), `order`, `active` |
| **Site Setting** | Configuración global del sitio | `key`, `value`, `type` (text/image/html) |
| **Navigation** | Menú de navegación dinámico | `label`, `url`, `order`, `target`, `parent`, `active` |

### 📝 Ejemplos (opcionales)

Están en `src/api/_examples/`. Para activar uno:

```bash
# Copiar el ejemplo al directorio de API
cp -r src/api/_examples/paper src/api/

# Reiniciar Strapi para que lo detecte
npm run develop
```

| Ejemplo | Descripción |
|---------|-------------|
| **Paper** | Research papers / publicaciones |
| **Testimonial** | Testimonios de clientes |

## Cómo agregar tu propio Content Type

1. Crea la estructura de carpetas:
```
src/api/mi-tipo/
├── content-types/
│   └── mi-tipo/
│       └── schema.json
├── controllers/
│   └── mi-tipo.ts
├── routes/
│   └── mi-tipo.ts
└── services/
    └── mi-tipo.ts
```

2. Define el schema en `schema.json` (ver ejemplos en `_examples/`)

3. Usa el boilerplate para controller, service y route:
```typescript
// controllers/mi-tipo.ts
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::mi-tipo.mi-tipo');

// services/mi-tipo.ts  
import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::mi-tipo.mi-tipo');

// routes/mi-tipo.ts
import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::mi-tipo.mi-tipo');
```

4. Reinicia Strapi — el nuevo content type aparece automáticamente.

## Base de datos

- **Por defecto: PostgreSQL** (puerto 5432). Configura `DATABASE_*` y `NODE_ENV=production`.
- Para desarrollo local con Docker (como en el upstream): `docker compose -f docker-compose.dev.yml up -d` y usa en `.env`: `DATABASE_CLIENT=postgres`, `DATABASE_HOST=localhost`, `DATABASE_PORT=5432`, `DATABASE_NAME=strapi`, `DATABASE_USERNAME=strapi`, `DATABASE_PASSWORD=strapi`.
- Para MySQL: `DATABASE_CLIENT=mysql`, puerto `3306`.

## Permisos (importante)

Después de crear contenido, configura los permisos públicos:

1. Ve a **Settings → Users & Permissions → Roles → Public**
2. Habilita `find` y `findOne` para los content types que necesites exponer
3. Guarda

## API

Strapi genera automáticamente endpoints REST:

```
GET    /api/page-sections          # Listar secciones
GET    /api/page-sections/:id      # Detalle
GET    /api/site-settings           # Listar configuraciones
GET    /api/navigations            # Menú de navegación
```

Filtros disponibles:
```
/api/page-sections?filters[page][$eq]=home&sort=order:asc
/api/site-settings?filters[key][$eq]=site_name
/api/navigations?filters[active][$eq]=true&sort=order:asc
```

## Contribuir al template

Si mejoras algo que beneficia a todos los proyectos:

1. Haz los cambios en tu fork
2. Abre un PR al repo template
3. Los demás proyectos hacen pull de las actualizaciones

## Tech Stack

- [Strapi v5](https://strapi.io/) — Headless CMS
- TypeScript
- PostgreSQL
