# Kiago Owner Frontend

Panel de control para usuarios `OWNER` de Kiago.

## Stack

- React + TypeScript + Vite
- React Router
- Axios
- Lucide React
- CSS responsive (sin dependencia obligatoria de Tailwind)

## Ejecutar

```bash
npm install
copy .env.example .env
npm run dev
```

En Linux/macOS:

```bash
cp .env.example .env
npm run dev
```

El frontend usa por defecto:

`http://localhost:8180`

Podés cambiarlo con `VITE_API_URL`.

## Rutas

- `/login`
- `/register`
- `/`
- `/places`
- `/places/new`
- `/places/:id`
- `/places/:id/edit`
- `/plans`
- `/profile`

## Seguridad JWT

El JWT se guarda en `localStorage` con la clave `kiago_token`. Axios agrega automáticamente:

`Authorization: Bearer <TOKEN>`

Un HTTP 401 elimina el token y dispara el regreso a login.

## Contratos asumidos

El frontend tolera varias formas comunes de respuesta (`data`, `content`, `places`, `plans`) para facilitar la integración, pero si el backend tiene DTOs con nombres distintos hay que ajustar `src/services/*` y `src/types.ts`.

### Login

Se aceptan `token`, `accessToken` o `jwt` en la respuesta.

### Place

Payload enviado:

```json
{
  "name": "La Terraza",
  "description": "Descripción",
  "category": "RESTAURANT",
  "address": "Calle 123",
  "latitude": -34.72,
  "longitude": -58.25,
  "metadata": {
    "cuisineType": "Argentina",
    "priceRange": "$$",
    "openingHours": "09:00-23:00"
  }
}
```

### Regla APPROVED -> PENDING

Si el lugar está aprobado, la pantalla de edición muestra una advertencia antes de guardar. La transición real a `PENDING` sigue siendo responsabilidad del backend.

## Categorías de metadata

Se incluyen formularios base para:

- RESTAURANT
- HOTEL
- MUSEUM
- COMMERCE
- ATTRACTION

Si tu backend define otras claves de metadata, editá `categoryFields` en `src/components/PlaceForm.tsx`.
