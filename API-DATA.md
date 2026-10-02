# Kiago API - Spring Boot

API REST de Kiago construida con Spring Boot, Spring Data JPA, Spring Security, JWT y Flyway.

## URL base

En desarrollo:

```text
http://localhost:8180
```

Todos los endpoints usan JSON:

```http
Content-Type: application/json
```

Los endpoints protegidos requieren:

```http
Authorization: Bearer <token>
```

El token se obtiene en `POST /api/auth/login` o al registrarse. El `ownerId` se obtiene del JWT; el frontend no debe enviarlo al crear o editar lugares.

## Formato general de respuesta

Las respuestas exitosas usan esta estructura:

```json
{
  "success": true,
  "data": {},
  "message": "Operación realizada correctamente"
}
```

Las respuestas de error usan:

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": []
}
```

`errors` puede no aparecer cuando el error no contiene errores detallados.

## Roles

Los roles disponibles son:

```text
TOURIST
OWNER
ADMIN
```

Si el registro no especifica `role`, se asigna `TOURIST`. Para operaciones de owner o admin, el usuario autenticado debe tener el rol correspondiente.

## Autenticación y usuarios

### Registrar usuario

`POST /api/auth/register`

También disponible como `POST /api/users/auth`.

Request:

```json
{
  "name": "Gabriel",
  "lastName": "Rolón",
  "email": "gabriel@example.com",
  "password": "secreto123",
  "phone": "+5491112345678",
  "role": "OWNER"
}
```

`last_name` también es aceptado como alternativa a `lastName`, pero no se deben enviar ambos con valores diferentes.

Campos:

| Campo | Tipo | Requerido | Detalle |
|---|---|---:|---|
| `name` | string | Sí | 1 a 100 caracteres |
| `lastName` o `last_name` | string | Sí | Hasta 100 caracteres |
| `email` | string | Sí | Email válido, hasta 150 caracteres |
| `password` | string | Sí | Entre 6 y 72 caracteres |
| `phone` | string | No | Hasta 30 caracteres |
| `role` | string | No | `TOURIST`, `OWNER` o `ADMIN` |

Respuesta `201`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Gabriel",
      "lastName": "Rolón",
      "email": "gabriel@example.com",
      "phone": "+5491112345678",
      "role": "OWNER",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  },
  "message": "Registro exitoso"
}
```

### Iniciar sesión

`POST /api/auth/login`

También disponible como `POST /api/users/auth/login`.

Request:

```json
{
  "email": "gabriel@example.com",
  "password": "secreto123"
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Gabriel",
      "lastName": "Rolón",
      "email": "gabriel@example.com",
      "phone": "+5491112345678",
      "role": "OWNER",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  },
  "message": "Inicio de sesión exitoso"
}
```

### Obtener usuario autenticado

`GET /api/auth/me`

No recibe body. Requiere JWT.

### Actualizar perfil

`PUT /api/auth/profile`

Request:

```json
{
  "name": "Gabriel Omar",
  "lastName": "Rolón",
  "phone": "+5491112345678"
}
```

Todos los campos son opcionales. `last_name` también es aceptado.

### Cambiar contraseña

`PUT /api/auth/change-password`

Request:

```json
{
  "currentPassword": "secreto123",
  "newPassword": "nuevoSecreto456"
}
```

## Lugares públicos

Estos endpoints no requieren autenticación. Sólo muestran lugares con estado `APPROVED`.

### Buscar lugares

`GET /api/public/places`

Query params opcionales:

| Parámetro | Tipo | Default | Detalle |
|---|---|---:|---|
| `category` | string | — | `GENERAL`, `RESTAURANT`, `HOTEL`, `MUSEUM`, `TOURIST_ATTRACTION`, `SHOP` |
| `city` | string | — | Filtra por ciudad |
| `province` | string | — | Filtra por provincia |
| `country` | string | — | Filtra por país |
| `search` | string | — | Busca en nombre y descripción |
| `page` | number | `1` | Página basada en 1 |
| `limit` | number | `20` | Se limita entre 1 y 100 |
| `sort` | string | `createdAt` | Usar `name` para ordenar ascendente por nombre |

Ejemplo:

```text
GET /api/public/places?city=Lanus&category=RESTAURANT&page=1&limit=20&sort=name
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 10,
        "ownerId": null,
        "name": "Restaurante Kiago",
        "description": "Descripción del lugar",
        "category": "RESTAURANT",
        "address": "Av. Principal 123",
        "city": "Lanús",
        "province": "Buenos Aires",
        "country": "Argentina",
        "latitude": -34.69266334998814,
        "longitude": -58.32902630840885,
        "phone": "+5491112345678",
        "email": "contacto@ejemplo.com",
        "website": "https://ejemplo.com",
        "imageUrl": "https://ejemplo.com/imagen.jpg",
        "metadata": {
          "cuisine_type": "Argentina"
        },
        "status": "APPROVED",
        "rejectionReason": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Operación realizada correctamente"
}
```

En la respuesta pública `ownerId` y `rejectionReason` son `null`.

### Obtener categorías

`GET /api/public/places/categories`

Respuesta:

```json
{
  "success": true,
  "data": {
    "categories": [
      "GENERAL",
      "RESTAURANT",
      "HOTEL",
      "MUSEUM",
      "TOURIST_ATTRACTION",
      "SHOP"
    ]
  },
  "message": "Operación realizada correctamente"
}
```

### Buscar lugares cercanos

`GET /api/public/places/nearby`

Parámetros requeridos:

| Parámetro | Tipo | Detalle |
|---|---|---|
| `latitude` | decimal | Entre `-90` y `90` |
| `longitude` | decimal | Entre `-180` y `180` |

Parámetros opcionales:

| Parámetro | Tipo | Default |
|---|---|---:|
| `radius` | decimal | `5000` metros |
| `page` | number | `1` |
| `limit` | number | `20`, máximo 100 |

Ejemplo:

```text
GET /api/public/places/nearby?latitude=-34.69266334998814&longitude=-58.32902630840885&radius=5000&page=1&limit=20
```

La respuesta tiene `items` con los datos del lugar y el campo adicional `distanceMeters`.

### Obtener un lugar público

`GET /api/public/places/{id}`

Ejemplo:

```text
GET /api/public/places/10
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "place": {}
  },
  "message": "Operación realizada correctamente"
}
```

## Planes

### Listar planes activos

`GET /api/plans`

No requiere autenticación.

Respuesta:

```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": 1,
        "code": "RESTAURANT",
        "name": "Restaurante",
        "description": "Plan para restaurantes",
        "maxPlaces": 1,
        "isActive": true,
        "fields": [
          {
            "id": 1,
            "fieldKey": "cuisine_type",
            "fieldType": "text",
            "isRequired": true
          }
        ]
      }
    ]
  },
  "message": "Operación realizada correctamente"
}
```

### Consultar el plan del usuario

`GET /api/plans/me`

Requiere JWT. Si el usuario no tiene un plan activo, `data.plan` es `null`.

### Seleccionar un plan

`POST /api/plans/select`

Request:

```json
{
  "code": "RESTAURANT"
}
```

`code` es obligatorio y debe corresponder a un plan activo.

## Endpoints de OWNER

Todos requieren JWT con rol `OWNER`.

### Dashboard

`GET /api/owner/dashboard`

Respuesta:

```json
{
  "success": true,
  "data": {
    "owner": {
      "id": 1,
      "name": "Gabriel",
      "email": "gabriel@example.com"
    },
    "statistics": {
      "totalPlaces": 1,
      "pendingPlaces": 1,
      "approvedPlaces": 0,
      "rejectedPlaces": 0
    },
    "plan": {
      "code": "RESTAURANT",
      "name": "Restaurante",
      "maxPlaces": 1
    },
    "recentPlaces": []
  },
  "message": "Operación realizada correctamente"
}
```

`plan` puede ser `null` si el owner todavía no seleccionó uno.

### Crear lugar

`POST /api/owner/places`

Request:

```json
{
  "name": "Restaurante Kiago",
  "description": "Restaurante de comida argentina",
  "category": "RESTAURANT",
  "address": "Av. Principal 123",
  "city": "Lanús",
  "province": "Buenos Aires",
  "country": "Argentina",
  "latitude": -34.69266334998814,
  "longitude": -58.32902630840885,
  "phone": "+5491112345678",
  "email": "contacto@ejemplo.com",
  "website": "https://ejemplo.com",
  "imageUrl": "https://ejemplo.com/imagen.jpg",
  "metadata": {
    "cuisine_type": "Argentina"
  }
}
```

Campos principales:

| Campo | Tipo | Requerido | Detalle |
|---|---|---:|---|
| `name` | string | Sí | Hasta 150 caracteres |
| `category` | string | Sí | Categoría válida |
| `description` | string | No | Hasta 2000 caracteres |
| `address` | string | No | Hasta 255 caracteres |
| `city`, `province`, `country` | string | No | Hasta 100 caracteres cada uno |
| `latitude` | decimal | No | Entre `-90` y `90`, hasta 14 decimales |
| `longitude` | decimal | No | Entre `-180` y `180`, hasta 14 decimales |
| `phone` | string | No | Hasta 30 caracteres |
| `email` | string | No | Hasta 150 caracteres |
| `website` | string | No | Hasta 500 caracteres |
| `imageUrl` | string | No | Hasta 1000 caracteres |
| `metadata` | object | Sí para campos específicos | Datos propios de la categoría |

Metadata requerida por categoría:

| Categoría | Campo requerido en `metadata` | Tipo |
|---|---|---|
| `RESTAURANT` | `cuisine_type` | string |
| `HOTEL` | `room_count` | entero positivo |
| `MUSEUM` | `museum_type` | string |

Para `GENERAL`, `SHOP` y `TOURIST_ATTRACTION` no hay un campo de metadata obligatorio.

El lugar se crea con estado `PENDING` y debe ser aprobado por un admin.

### Listar lugares del owner

`GET /api/owner/places`

No recibe parámetros ni body. Devuelve los lugares pertenecientes al owner autenticado.

### Obtener un lugar del owner

`GET /api/owner/places/{id}`

Ejemplo:

```text
GET /api/owner/places/10
```

### Editar un lugar

`PUT /api/owner/places/{id}`

Recibe los mismos campos de creación. Todos son opcionales en la edición:

```json
{
  "name": "Nuevo nombre",
  "latitude": -34.69266334998814,
  "longitude": -58.32902630840885,
  "metadata": {
    "cuisine_type": "Argentina"
  }
}
```

Al editar un lugar aprobado, vuelve a estado `PENDING` para requerir una nueva aprobación.

### Eliminar un lugar

`DELETE /api/owner/places/{id}`

No recibe body. El borrado es lógico mediante `deleted_at`.

## Endpoints de ADMIN

Todos requieren JWT con rol `ADMIN`.

### Listar lugares

`GET /api/admin/places`

Query params:

| Parámetro | Tipo | Default |
|---|---|---:|
| `status` | string | todos |
| `page` | number | `1` |
| `limit` | number | `20` |

`status` puede ser `DRAFT`, `PENDING`, `APPROVED` o `REJECTED`.

Ejemplo:

```text
GET /api/admin/places?status=PENDING&page=1&limit=20
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "places": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0
    }
  },
  "message": "Operación realizada correctamente"
}
```

### Listar lugares pendientes

`GET /api/admin/places/pending?page=1&limit=20`

### Obtener lugar por ID

`GET /api/admin/places/{id}`

### Aprobar lugar

`PUT /api/admin/places/{id}/approve`

Body opcional:

```json
{
  "status": "APPROVED"
}
```

También se acepta `{}`. Si se envía `status`, debe ser `APPROVED`.

### Rechazar lugar

`PUT /api/admin/places/{id}/reject`

Body:

```json
{
  "status": "REJECTED",
  "rejection_reason": "La información del lugar está incompleta"
}
```

`status`, si se envía, debe ser `REJECTED`. `rejection_reason` puede ser `null`.

## Modelo `Place`

Los endpoints de owner y admin devuelven un objeto con esta forma:

```json
{
  "id": 10,
  "ownerId": 1,
  "name": "Restaurante Kiago",
  "description": "Descripción",
  "category": "RESTAURANT",
  "address": "Av. Principal 123",
  "city": "Lanús",
  "province": "Buenos Aires",
  "country": "Argentina",
  "latitude": -34.69266334998814,
  "longitude": -58.32902630840885,
  "phone": "+5491112345678",
  "email": "contacto@ejemplo.com",
  "website": "https://ejemplo.com",
  "imageUrl": "https://ejemplo.com/imagen.jpg",
  "metadata": {},
  "status": "PENDING",
  "rejectionReason": null
}
```

Valores posibles de `status`:

```text
DRAFT, PENDING, APPROVED, REJECTED
```

Las coordenadas deben enviarse como números JSON, no como strings:

```json
{
  "latitude": -34.69266334998814,
  "longitude": -58.32902630840885
}
```

## Códigos HTTP frecuentes

| Código | Significado |
|---:|---|
| `200` | Operación exitosa |
| `201` | Recurso creado |
| `401` | Falta autenticación o las credenciales son incorrectas |
| `403` | El usuario autenticado no tiene el rol requerido |
| `404` | Recurso no encontrado |
| `409` | Conflicto, por ejemplo email ya registrado |
| `422` | Error de validación o datos inválidos |
| `500` | Error inesperado del servidor |

## Ejemplo con Axios

```ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8180",
  headers: {
    "Content-Type": "application/json",
  },
});

const login = await api.post("/api/auth/login", {
  email: "gabriel@example.com",
  password: "secreto123",
});

const token = login.data.data.token;

const place = await api.post(
  "/api/owner/places",
  {
    name: "Restaurante Kiago",
    category: "RESTAURANT",
    latitude: -34.69266334998814,
    longitude: -58.32902630840885,
    metadata: {
      cuisine_type: "Argentina",
    },
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);
```

## Configuración y ejecución

Variables principales:

| Variable | Default |
|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/kiago_db?...` |
| `DB_USERNAME` | `root` |
| `DB_PASSWORD` | `admin` |
| `PORT` | `8180` |
| `JWT_SECRET` | valor de desarrollo; usar uno seguro en producción |
| `JWT_EXPIRATION_MS` | `86400000` |
| `FLYWAY_ENABLED` | `true` |
| `ADMIN_SEED_ENABLED` | `false` |

El secreto JWT debe tener al menos 32 caracteres.

Ejecutar:

```bash
mvn spring-boot:run
```

Swagger UI está disponible en:

```text
http://localhost:8180/swagger-ui.html
```

La especificación OpenAPI está disponible en:

```text
http://localhost:8180/v3/api-docs
```

## Migraciones de base de datos

Flyway administra las migraciones ubicadas en `src/main/resources/db/migration`.

La migración `V8__increase_place_coordinate_precision.sql` cambia las coordenadas a `DECIMAL(18,14)` para aceptar valores como:

```text
-34.69266334998814
-58.32902630840885
```

En una base existente, asegurarse de que Flyway esté habilitado y reiniciar la API para ejecutar la migración.

