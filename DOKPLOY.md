# Despliegue en Dokploy con Railpack

Este proyecto está listo para desplegarse en [Dokploy](https://dokploy.com) usando **Railpack** como tipo de build. La raíz del repo incluye `railpack.json`, que define el comando de arranque y la versión de Node.

Referencia: [Build Type — Dokploy](https://docs.dokploy.com/docs/core/applications/build-type), [Railpack — Environment Variables](https://railpack.com/config/environment-variables).

---

## Pasos en Dokploy

1. **Crear una nueva Application** y conectar el repositorio (Git).

2. **Build Type**: seleccionar **Railpack** (no Nixpacks ni Dockerfile).

3. **Puerto**:
   - En la configuración de la aplicación, el puerto que expone el contenedor debe ser **1337** (o el valor que definas en `PORT`).
   - Strapi usa la variable de entorno `PORT` (por defecto 1337). Asegúrate de que en Dominios/Rutas el tráfico llegue a ese puerto.

4. **Variables de entorno** (pestaña Environment Variables): añadir al menos las siguientes.

### Obligatorias (producción)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno | `production` |
| `HOST` | Bind del servidor | `0.0.0.0` |
| `PORT` | Puerto interno | `1337` |
| `URL` | URL pública del CMS | `https://cms.tudominio.com` |
| `APP_KEYS` | Claves separadas por coma | (generar 2 claves) |
| `API_TOKEN_SALT` | Salt para API tokens | (string aleatorio) |
| `ADMIN_JWT_SECRET` | JWT del admin | (string aleatorio) |
| `TRANSFER_TOKEN_SALT` | Salt transfer tokens | (string aleatorio) |
| `JWT_SECRET` | JWT general | (string aleatorio) |
| `ENCRYPTION_KEY` | Clave de cifrado | (string aleatorio) |

### Base de datos (PostgreSQL recomendado)

| Variable | Ejemplo |
|----------|---------|
| `DATABASE_CLIENT` | `postgres` |
| `DATABASE_HOST` | Host del Postgres (servicio en Dokploy o externo) |
| `DATABASE_PORT` | `5432` |
| `DATABASE_NAME` | Nombre de la BD |
| `DATABASE_USERNAME` | Usuario |
| `DATABASE_PASSWORD` | Contraseña |

Si la BD es un **servicio PostgreSQL** en Dokploy, usa el host interno del servicio (p. ej. nombre del servicio) y el puerto 5432. Las credenciales las defines al crear el servicio.

### Opcionales

| Variable | Descripción |
|----------|-------------|
| `PROXY` | Si hay proxy inverso delante (p. ej. Traefik) | `true` |

---

## Comportamiento de Railpack con este repo

- **Detección**: Railpack detecta Node.js por `package.json`.
- **Install**: Instala dependencias con `npm install` (o el lockfile que tengas).
- **Build**: Ejecuta el script `build` de `package.json` → `strapi build` (genera `dist/`).
- **Start**: Lo define `railpack.json` → `node app.js` (usa `distDir: ./dist` y `appDir` correctos).

No hace falta definir `RAILPACK_BUILD_CMD` ni `RAILPACK_START_CMD` en Dokploy; `railpack.json` ya fija el comando de arranque y el provider Node. Si quisieras sobreescribir desde la UI:

- `RAILPACK_BUILD_CMD`: por defecto no necesario (usa `npm run build`).
- `RAILPACK_START_CMD`: por defecto `node app.js` (definido en `railpack.json`).

---

## Versión de Node

En `railpack.json` está fijado `"node": "20"` dentro del rango soportado por Strapi (>=20 <=24). Para otra versión puedes:

- Cambiar en el repo el campo `packages.node` en `railpack.json`, o
- En Dokploy, definir la variable de entorno `RAILPACK_NODE_VERSION` (p. ej. `22`).

---

## Resumen rápido

1. Application → Repo conectado.
2. Build Type: **Railpack**.
3. Puerto de la app: **1337**.
4. Añadir todas las variables de entorno de producción y base de datos.
5. Desplegar.

Si la base de datos está en otro servicio (Dokploy o externo), asegúrate de que el contenedor de Strapi tenga red o acceso a ese host/puerto.
