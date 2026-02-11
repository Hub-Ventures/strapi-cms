# CMS Template

Plantilla reutilizable de CMS basada en **Strapi v5**. Fork este repo para crear el CMS de cualquier proyecto web.

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

- **Desarrollo:** SQLite (por defecto, cero configuración)
- **Producción:** PostgreSQL (configura las variables `DATABASE_*` en `.env`)

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
- SQLite (dev) / PostgreSQL (prod)
