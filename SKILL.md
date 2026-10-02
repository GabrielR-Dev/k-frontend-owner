---
name: kiago-data
description: "Usar cuando se necesite cargar, modelar, validar o consultar datos de Kiago: usuarios, planes, plan_fields, lugares, metadata por categoria, aprobaciones, historial de estados o flujos de la API."
---

# Datos y funcionamiento actual de Kiago

Esta guia describe el contrato actual de la API. La fuente de verdad de la base
de datos son las migraciones y la validacion efectiva de entradas la hacen los
schemas Joi y los services.

## Flujo completo

1. Crear la base de datos.
2. Ejecutar migraciones.
3. Ejecutar seeds: administrador, planes y campos descriptivos.
4. Registrar un usuario con rol `OWNER`.
5. Asignarle un plan mediante `POST /api/plans/select`.
6. Crear lugares. El `owner_id` se toma del JWT, nunca del body.
7. Cada lugar nuevo queda en estado `PENDING`.
8. Un `ADMIN` aprueba o rechaza el lugar.
9. Solo los lugares `APPROVED` aparecen en la API publica.
10. Si el dueño edita un lugar aprobado, vuelve a `PENDING` para otra revision.

Inicializacion:

```bash
npm run db:create
npm run migrate
npm run seed
npm run dev
```

## Modelo de datos

### `users`

| Campo           | Tipo                    | Requerido | Valores o reglas                               |
| --------------- | ----------------------- | --------: | ---------------------------------------------- |
| `id`            | integer autoincremental |        si | PK                                             |
| `name`          | string(100)             |        si | Nombre                                         |
| `last_name`     | string(100)             |        si | Apellido                                       |
| `email`         | string(150)             |        si | Unico; formato email al registrarse            |
| `password_hash` | string(255)             |        si | Hash bcrypt; nunca se envia al cliente         |
| `phone`         | string(30)              |        no | Telefono                                       |
| `role`          | enum                    |        si | `OWNER`, `ADMIN`, `TOURIST`; default `TOURIST` |
| `is_active`     | boolean                 |        si | Default `true`                                 |
| `created_at`    | datetime                |        si | Automatico                                     |
| `updated_at`    | datetime                |        si | Automatico                                     |

Los registros de la app solo pueden registrarse como `OWNER` o `TOURIST`.
`ADMIN` se crea por seed y no debe permitirse desde el formulario publico.

Payload de registro:

```json
{
  "name": "Juan",
  "lastName": "Perez",
  "email": "juan@example.com",
  "password": "12345678",
  "phone": "+5491112345678",
  "role": "OWNER"
}
```

`lastName` o `last_name` es obligatorio al registrar. La base guarda el valor
en `last_name`. La contrasena debe tener entre 6 y 72 caracteres.

### `plans`

Un plan define el tipo de negocio y cuantos lugares activos puede cargar un
usuario.

| Campo                      | Tipo                    | Requerido | Regla                                             |
| -------------------------- | ----------------------- | --------: | ------------------------------------------------- |
| `id`                       | integer autoincremental |        si | PK                                                |
| `code`                     | string(50)              |        si | Unico; coincide normalmente con `places.category` |
| `name`                     | string(100)             |        si | Nombre visible                                    |
| `description`              | text                    |        no | Descripcion                                       |
| `max_places`               | integer                 |        si | Limite de lugares activos                         |
| `is_active`                | boolean                 |        si | Default `true`                                    |
| `created_at`, `updated_at` | datetime                |        si | Automaticos                                       |

Planes sembrados actualmente:

| `code`               | Nombre               | `max_places` | Uso                         |
| -------------------- | -------------------- | -----------: | --------------------------- |
| `GENERAL`            | General              |            3 | Lugares generales           |
| `RESTAURANT`         | Dueno de restaurante |           10 | Restaurantes y bares        |
| `HOTEL`              | Dueno de hotel       |            5 | Hoteles y alojamientos      |
| `MUSEUM`             | Museo                |            5 | Museos y centros culturales |
| `TOURIST_ATTRACTION` | Atraccion turistica  |            8 | Atracciones y actividades   |
| `SHOP`               | Comercio             |           10 | Comercios y tiendas         |

### `plan_fields`

Es el catalogo que permite al frontend construir formularios. No reemplaza la
validacion real de `metadata`, que esta en `src/validators/place.validator.js`.

| Campo                      | Tipo        | Regla                                         |
| -------------------------- | ----------- | --------------------------------------------- |
| `id`                       | integer     | PK                                            |
| `plan_id`                  | integer     | FK a `plans.id`; cascade al borrar            |
| `field_key`                | string(100) | Nombre de la propiedad en `metadata`          |
| `field_type`               | enum        | `string`, `number`, `boolean`, `text`, `time` |
| `is_required`              | boolean     | Si se muestra como requerido                  |
| `created_at`, `updated_at` | datetime    | Automaticos                                   |

Campos sembrados:

| Plan                 | Campos                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESTAURANT`         | `cuisine_type` requerido; `price_range`, `opening_hours`, `reservation_url`, `delivery_available`, `takeaway_available`, `vegetarian_options`, `vegan_options` opcionales |
| `HOTEL`              | `room_count` requerido; `check_in_time`, `check_out_time`, `has_breakfast`, `has_parking`, `has_wifi`, `booking_url` opcionales                                           |
| `MUSEUM`             | `museum_type` requerido; `opening_hours`, `ticket_price`, `guided_tours`, `accessibility` opcionales                                                                      |
| `TOURIST_ATTRACTION` | `duration`, `recommended_age`, `ticket_price`, `opening_hours`, `reservation_required` opcionales                                                                         |
| `GENERAL`            | Sin campos sembrados                                                                                                                                                      |
| `SHOP`               | Sin campos sembrados                                                                                                                                                      |

### `user_plans`

Relaciona un usuario con un plan.

| Campo                      | Tipo     | Regla                               |
| -------------------------- | -------- | ----------------------------------- |
| `id`                       | integer  | PK                                  |
| `user_id`                  | integer  | FK a `users.id`; cascade            |
| `plan_id`                  | integer  | FK a `plans.id`; cascade            |
| `is_active`                | boolean  | Indica el plan usado para el limite |
| `created_at`, `updated_at` | datetime | Automaticos                         |

Antes de crear un lugar debe existir un `user_plan` activo. El service compara
la cantidad de lugares activos del dueño contra `plan.max_places`.

### `places`

| Campo                      | Tipo                    | Requerido | Regla                                                                    |
| -------------------------- | ----------------------- | --------: | ------------------------------------------------------------------------ |
| `id`                       | integer autoincremental |        si | PK                                                                       |
| `owner_id`                 | integer                 |        si | FK a `users.id`; viene del JWT                                           |
| `name`                     | string(150)             |        si | Nombre del lugar                                                         |
| `description`              | text                    |        no | Hasta 2000 caracteres en Joi                                             |
| `category`                 | enum                    |        si | `GENERAL`, `RESTAURANT`, `HOTEL`, `MUSEUM`, `TOURIST_ATTRACTION`, `SHOP` |
| `address`                  | string(255)             |        no | Direccion                                                                |
| `city`                     | string(100)             |        no | Ciudad                                                                   |
| `province`                 | string(100)             |        no | Provincia o estado                                                       |
| `country`                  | string(100)             |        no | Pais                                                                     |
| `latitude`                 | decimal(10,7)           |        no | Entre -90 y 90                                                           |
| `longitude`                | decimal(10,7)           |        no | Entre -180 y 180                                                         |
| `phone`                    | string(30)              |        no | Telefono                                                                 |
| `email`                    | string(150)             |        no | Contacto; Joi lo trata como string                                       |
| `website`                  | string(255)             |        no | URL; la migracion limita a 255                                           |
| `image_url`                | string(255)             |        no | En el body se envia como `imageUrl`                                      |
| `metadata`                 | JSON                    |        no | Campos especificos de la categoria                                       |
| `status`                   | enum                    |        si | `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`; nuevo: `PENDING`             |
| `rejection_reason`         | text                    |        no | Motivo de rechazo                                                        |
| `approved_at`              | datetime                |        no | Se completa al aprobar                                                   |
| `approved_by`              | integer                 |        no | Admin que aprobo                                                         |
| `created_at`, `updated_at` | datetime                |        si | Automaticos                                                              |
| `deleted_at`               | datetime                |        no | Borrado logico                                                           |

No enviar desde el cliente: `owner_id`, `ownerId`, `status`, `approved_by`,
`approved_at` ni `rejection_reason`. El service elimina esos valores y controla
el workflow.

### `place_status_history`

Registra cada cambio de estado.

| Campo             | Tipo       | Regla                     |
| ----------------- | ---------- | ------------------------- |
| `id`              | integer    | PK                        |
| `place_id`        | integer    | FK a `places.id`; cascade |
| `previous_status` | string(20) | Puede ser `null` al crear |
| `new_status`      | string(20) | Estado nuevo              |
| `reason`          | text       | Motivo del cambio         |
| `changed_by`      | integer    | FK a `users.id`           |
| `created_at`      | datetime   | Automatico                |

## Metadata por categoria

El body usa `metadata` como objeto JSON. La categoria se normaliza a mayusculas.
Tambien se aceptan los alias de entrada `COMMERCE` -> `SHOP` y `ATTRACTION` ->
`TOURIST_ATTRACTION`.

Campos efectivos:

| Categoria            | Requeridos               | Opcionales validos                                                                                                                   |
| -------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `GENERAL`            | Ninguno                  | Cualquier campo adicional                                                                                                            |
| `RESTAURANT`         | `cuisine_type` string    | `price_range`, `opening_hours`, `reservation_url`, `delivery_available`, `takeaway_available`, `vegetarian_options`, `vegan_options` |
| `HOTEL`              | `room_count` entero >= 1 | `check_in_time`, `check_out_time`, `has_breakfast`, `has_parking`, `has_wifi`, `booking_url`                                         |
| `MUSEUM`             | `museum_type` string     | `opening_hours`, `ticket_price` >= 0, `guided_tours`, `accessibility`                                                                |
| `TOURIST_ATTRACTION` | Ninguno                  | `duration`, `recommended_age`, `ticket_price` >= 0, `opening_hours`, `reservation_required`                                          |
| `SHOP`               | Ninguno                  | Cualquier campo adicional                                                                                                            |

Ejemplo de restaurante:

```json
{
  "name": "La Esquina",
  "description": "Cocina argentina de temporada",
  "category": "RESTAURANT",
  "address": "Av. Corrientes 123",
  "city": "Buenos Aires",
  "province": "Buenos Aires",
  "country": "Argentina",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "phone": "+541112345678",
  "email": "contacto@laesquina.example",
  "website": "https://laesquina.example",
  "imageUrl": "https://cdn.example/la-esquina.jpg",
  "metadata": {
    "cuisine_type": "Argentina",
    "price_range": "$$",
    "opening_hours": "12:00-23:00",
    "reservation_url": "https://laesquina.example/reservas",
    "delivery_available": true,
    "takeaway_available": true,
    "vegetarian_options": true,
    "vegan_options": false
  }
}
```

El frontend puede enviar camelCase para algunos valores de metadata: `cuisineType`,
`priceRange`, `openingHours`, `roomCount`, `museumType` y `ticketPrice`; el service
los copia a sus nombres snake_case. Para mantener respuestas y datos consistentes,
se recomienda enviar siempre snake_case.

## API y cargas

Todas las respuestas exitosas siguen esta forma:

```json
{ "success": true, "data": {}, "message": "..." }
```

### Autenticacion

| Metodo | Ruta                        | Acceso  | Body principal                   |
| ------ | --------------------------- | ------- | -------------------------------- |
| POST   | `/api/auth/register`        | Publico | Registro de usuario              |
| POST   | `/api/auth/login`           | Publico | `{ "email", "password" }`        |
| GET    | `/api/auth/me`              | JWT     | Sin body                         |
| PUT    | `/api/auth/profile`         | JWT     | `name`, `lastName`, `phone`      |
| PUT    | `/api/auth/change-password` | JWT     | `currentPassword`, `newPassword` |

Login y registro devuelven `data.user` y `data.token`. Usar el token asi:

```text
Authorization: Bearer <JWT>
```

Rutas de compatibilidad para el frontend Angular:
`POST /api/users/auth` y `POST /api/users/auth/login`.

### Planes

| Metodo | Ruta                | Acceso  | Body                       |
| ------ | ------------------- | ------- | -------------------------- |
| GET    | `/api/plans`        | Publico | Incluye `fields`           |
| GET    | `/api/plans/me`     | JWT     | Plan activo del usuario    |
| POST   | `/api/plans/select` | JWT     | `{ "code": "RESTAURANT" }` |

### Dueño

Todas las rutas requieren JWT y rol `OWNER`.

| Metodo | Ruta                    | Resultado                                 |
| ------ | ----------------------- | ----------------------------------------- |
| GET    | `/api/owner/dashboard`  | Estadisticas, plan y lugares recientes    |
| POST   | `/api/owner/places`     | Crea lugar en `PENDING`                   |
| GET    | `/api/owner/places`     | Lista lugares del dueño                   |
| GET    | `/api/owner/places/:id` | Detalle propio                            |
| PUT    | `/api/owner/places/:id` | Actualiza; un aprobado vuelve a `PENDING` |
| DELETE | `/api/owner/places/:id` | Borrado logico mediante `deleted_at`      |

Crear lugar requiere plan activo y no superar `max_places`.

### Administracion

Todas las rutas requieren JWT y rol `ADMIN`.

| Metodo | Ruta                            | Body                                                  |
| ------ | ------------------------------- | ----------------------------------------------------- |
| GET    | `/api/admin/places`             | Filtro opcional `?status=PENDING`                     |
| GET    | `/api/admin/places/pending`     | Sin body                                              |
| GET    | `/api/admin/places/:id`         | Sin body                                              |
| PUT    | `/api/admin/places/:id/approve` | `{ "status": "APPROVED" }`                            |
| PUT    | `/api/admin/places/:id/reject`  | `{ "status": "REJECTED", "rejection_reason": "..." }` |

El rechazo exige un motivo de 3 a 1000 caracteres. Aprobar o rechazar actualiza
el lugar y crea una fila en `place_status_history`.

### Publica

No requiere autenticacion y nunca devuelve lugares que no esten aprobados.

| Metodo | Ruta                            | Query o resultado                                                                 |
| ------ | ------------------------------- | --------------------------------------------------------------------------------- |
| GET    | `/api/public/places`            | `category`, `city`, `province`, `country`, `search`, `page`, `limit`, `sort=name` |
| GET    | `/api/public/places/categories` | Categorias disponibles                                                            |
| GET    | `/api/public/places/nearby`     | Requiere `latitude`, `longitude`; acepta `radius` en metros                       |
| GET    | `/api/public/places/:id`        | Detalle de un lugar aprobado                                                      |

Listado paginado:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
  }
}
```

La busqueda `nearby` agrega `distanceMeters` a los resultados.

## Estados y reglas de negocio

| Evento                  | Estado resultante | Historial                                      |
| ----------------------- | ----------------- | ---------------------------------------------- |
| Crear lugar             | `PENDING`         | Si, desde `null`                               |
| Admin aprueba           | `APPROVED`        | Si; completa `approved_at` y `approved_by`     |
| Admin rechaza           | `REJECTED`        | Si; guarda `rejection_reason`                  |
| Dueño edita un aprobado | `PENDING`         | Si; limpia aprobacion y motivo                 |
| Dueño elimina           | Cualquier estado  | No se borra fisicamente; se llena `deleted_at` |

El ownership se verifica en backend: un dueño solo puede listar, consultar,
editar o borrar sus propios lugares.

## Carga inicial y configuracion

Variables relevantes:

```env
PORT=8180
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kiago_db
DB_USER=root
DB_PASSWORD=admin
JWT_SECRET=cambiar_por_un_secret_seguro
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:4200
ADMIN_SEED_EMAIL=admin@kiago.com
ADMIN_SEED_PASSWORD=CambiarEsteAdmin123!
```

El seed crea el administrador con el email configurado, el rol `ADMIN` y la
contrasena hasheada. Cambiar las credenciales de ejemplo antes de usar un entorno
accesible externamente.

## Convenciones importantes

- En JSON de entrada se usan camelCase en campos heredados del frontend (`lastName`, `imageUrl`), pero la persistencia usa snake_case (`last_name`, `image_url`).
- `plan_fields` es descriptivo; Joi es quien decide si una metadata es valida.
- Los schemas de metadata permiten propiedades desconocidas. Para datos predecibles, usar solamente los campos de las tablas anteriores.
- La migracion de `website` permite 255 caracteres y la de `image_url` 255; respetar esos limites aunque el validador de entrada sea mas amplio.
- La base usa `SHOP`, aunque el alias de entrada `COMMERCE` tambien es aceptado.
- La base usa `TOURIST_ATTRACTION`, aunque el alias de entrada `ATTRACTION` tambien es aceptado.
- Nunca confiar en `owner_id`, estados o datos de aprobacion enviados por el cliente.

## Archivos fuente

- Migraciones: `src/database/migrations/`
- Seeds: `src/database/seeders/`
- Modelos y asociaciones: `src/models/`
- Validadores: `src/validators/auth.validator.js` y `src/validators/place.validator.js`
- Logica de lugares: `src/services/place.service.js`
- Rutas: `src/routes/`
- Pruebas: `tests/unit/` y `tests/integration/`
