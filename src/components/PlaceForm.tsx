import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Place, PlacePayload } from "../types";

type Field = {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "time";
  required?: boolean;
  placeholder?: string;
};

const categoryFields: Record<string, Field[]> = {
  RESTAURANT: [
    {
      key: "cuisine_type",
      label: "Tipo de cocina",
      type: "text",
      required: true,
      placeholder: "Ej. Argentina, italiana",
    },
    {
      key: "price_range",
      label: "Rango de precios",
      type: "text",
      placeholder: "$$",
    },
    {
      key: "opening_hours",
      label: "Horarios",
      type: "text",
      placeholder: "Lun-Dom 09:00-23:00",
    },
    {
      key: "reservation_url",
      label: "URL de reservas",
      type: "text",
      placeholder: "https://...",
    },
    { key: "delivery_available", label: "Tiene delivery", type: "boolean" },
    { key: "takeaway_available", label: "Tiene take away", type: "boolean" },
    {
      key: "vegetarian_options",
      label: "Opciones vegetarianas",
      type: "boolean",
    },
    { key: "vegan_options", label: "Opciones veganas", type: "boolean" },
  ],
  HOTEL: [
    {
      key: "room_count",
      label: "Cantidad de habitaciones",
      type: "number",
      required: true,
      placeholder: "20",
    },
    { key: "check_in_time", label: "Hora de check-in", type: "time" },
    { key: "check_out_time", label: "Hora de check-out", type: "time" },
    { key: "has_breakfast", label: "Incluye desayuno", type: "boolean" },
    { key: "has_parking", label: "Tiene estacionamiento", type: "boolean" },
    { key: "has_wifi", label: "Tiene Wi-Fi", type: "boolean" },
    {
      key: "booking_url",
      label: "URL de reservas",
      type: "text",
      placeholder: "https://...",
    },
  ],
  MUSEUM: [
    {
      key: "museum_type",
      label: "Tipo de museo",
      type: "text",
      required: true,
      placeholder: "Historia, arte, ciencia...",
    },
    {
      key: "opening_hours",
      label: "Horarios",
      type: "text",
      placeholder: "Mar-Dom 10:00-18:00",
    },
    {
      key: "ticket_price",
      label: "Precio de entrada",
      type: "number",
      placeholder: "0",
    },
    { key: "guided_tours", label: "Ofrece visitas guiadas", type: "boolean" },
    {
      key: "accessibility",
      label: "Accesibilidad",
      type: "text",
      placeholder: "Rampas, audio guía...",
    },
  ],
  TOURIST_ATTRACTION: [
    {
      key: "duration",
      label: "Duración",
      type: "text",
      placeholder: "2 horas",
    },
    {
      key: "recommended_age",
      label: "Edad recomendada",
      type: "text",
      placeholder: "A partir de 6 años",
    },
    {
      key: "ticket_price",
      label: "Precio de entrada",
      type: "number",
      placeholder: "0",
    },
    {
      key: "opening_hours",
      label: "Horarios",
      type: "text",
      placeholder: "10:00-20:00",
    },
    { key: "reservation_required", label: "Requiere reserva", type: "boolean" },
  ],
};

function coordinateValue(value: string) {
  if (!value) return undefined;
  return Number(Number(value).toFixed(14));
}

const DEFAULT_MAP_CENTER: [number, number] = [-34.6924, -58.3292];

function LocationPicker({
  position,
  onChange,
}: {
  position: [number, number] | null;
  onChange: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return position ? (
    <CircleMarker
      center={position}
      radius={10}
      pathOptions={{ color: "#5148d8", fillColor: "#7167f2", fillOpacity: 0.9 }}
    >
      <Popup>Ubicación seleccionada</Popup>
    </CircleMarker>
  ) : null;
}

function MapCenter({ position }: { position: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.setView(position, Math.max(map.getZoom(), 15));
  }, [map, position]);

  return null;
}

export function PlaceForm({
  initial,
  categories,
  onSubmit,
  onCancel,
  saving,
}: {
  initial?: Place;
  categories: string[];
  onSubmit: (payload: PlacePayload) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(
    initial?.category || categories[0] || "",
  );
  const [address, setAddress] = useState(initial?.address || "");
  const [latitude, setLatitude] = useState(initial?.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(
    initial?.longitude?.toString() || "",
  );
  const [city, setCity] = useState(initial?.city || "");
  const [province, setProvince] = useState(initial?.province || "");
  const [country, setCountry] = useState(initial?.country || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [website, setWebsite] = useState(initial?.website || "");
  const [imageUrl, setImageUrl] = useState(
    initial?.imageUrl || initial?.image_url || "",
  );
  const [metadata, setMetadata] = useState<Record<string, unknown>>(
    initial?.metadata || {},
  );
  const [cityCenter, setCityCenter] = useState<[number, number] | null>(null);
  const [locatingCity, setLocatingCity] = useState(false);

  useEffect(() => setMetadata(initial?.metadata || {}), [initial?.id]);
  useEffect(() => {
    if (!category && categories[0]) setCategory(categories[0]);
  }, [categories, category]);

  const fields = useMemo(() => categoryFields[category] || [], [category]);
  const mapPosition =
    latitude && longitude && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
      ? ([Number(latitude), Number(longitude)] as [number, number])
      : null;

  const locateCity = async () => {
    const cityQuery = [city, province, country].filter(Boolean).join(", ");
    if (!cityQuery) return;
    setLocatingCity(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ar&q=${encodeURIComponent(cityQuery)}`,
        { headers: { Accept: "application/json" } },
      );
      const results = (await response.json()) as Array<{
        lat: string;
        lon: string;
      }>;
      const result = results[0];
      if (result) setCityCenter([Number(result.lat), Number(result.lon)]);
    } catch {
      // The map keeps its current center if geocoding is unavailable.
    } finally {
      setLocatingCity(false);
    }
  };

  const setCoordinates = (nextLatitude: number, nextLongitude: number) => {
    setLatitude(nextLatitude.toFixed(14));
    setLongitude(nextLongitude.toFixed(14));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const metadataPayload = Object.fromEntries(
      Object.entries(metadata).filter(
        ([, value]) => value !== "" && value !== undefined,
      ),
    );
    await onSubmit({
      name,
      description,
      category,
      address,
      ...(description && { description }),
      ...(address && { address }),
      ...(city && { city }),
      ...(province && { province }),
      ...(country && { country }),
      ...(latitude && { latitude: coordinateValue(latitude) }),
      ...(longitude && { longitude: coordinateValue(longitude) }),
      ...(phone && { phone }),
      ...(email && { email }),
      ...(website && { website }),
      ...(imageUrl && { imageUrl }),
      ...(Object.keys(metadataPayload).length > 0 || !initial
        ? { metadata: metadataPayload }
        : {}),
    });
  };

  return (
    <form onSubmit={submit} className="form-card">
      <div className="section-title">
        <div>
          <h3>{initial ? "Editar lugar" : "Nuevo lugar"}</h3>
          <p>Completá la información que verá el turista.</p>
        </div>
      </div>

      {initial?.status === "APPROVED" && (
        <div className="warning-box">
          ⚠️{" "}
          <div>
            <strong>Importante:</strong> al editar un lugar aprobado, volverá a{" "}
            <b>PENDIENTE</b> para una nueva revisión del administrador.
          </div>
        </div>
      )}

      <div className="form-grid">
        <label>
          Nombre del establecimiento
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ej. La Terraza"
          />
        </label>
        <label>
          Categoría
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setMetadata({});
            }}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="full">
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Contá brevemente qué ofrece el lugar..."
          />
        </label>
        <label className="full">
          Dirección
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={255}
            placeholder="Calle, número"
          />
        </label>
        <label>
          Ciudad
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={locateCity}
            maxLength={100}
          />
        </label>
        <label>
          Provincia
          <input
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            maxLength={100}
          />
        </label>
        <label>
          País
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            maxLength={100}
          />
        </label>
        <label>
          Teléfono
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
          />
        </label>
        <label>
          Email de contacto
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={150}
          />
        </label>
        <label>
          Web
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            maxLength={255}
            placeholder="https://..."
          />
        </label>
        <label className="full">
          URL de imagen
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            maxLength={255}
            placeholder="https://..."
          />
        </label>
        <label>
          Latitud
          <input
            type="number"
            step="0.00000000000001"
            min="-90"
            max="90"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="-34.7200"
          />
        </label>
        <label>
          Longitud
          <input
            type="number"
            step="0.00000000000001"
            min="-180"
            max="180"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="-58.2500"
          />
        </label>
      </div>

      <div className="location-picker">
        <div className="section-title">
          <div>
            <h3>Ubicación en el mapa</h3>
            <p>
              {city
                ? "El mapa se centra en la ciudad al salir del campo. Hacé clic para elegir el punto exacto."
                : "Hacé clic en el mapa para seleccionar la ubicación exacta."}
            </p>
          </div>
          {city && (
            <button
              type="button"
              className="btn secondary location-button"
              onClick={locateCity}
              disabled={locatingCity}
            >
              {locatingCity ? "Buscando ciudad..." : "Centrar en la ciudad"}
            </button>
          )}
        </div>
        <MapContainer
          center={mapPosition || cityCenter || DEFAULT_MAP_CENTER}
          zoom={mapPosition ? 15 : 12}
          scrollWheelZoom
          className="location-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenter position={mapPosition || cityCenter} />
          <LocationPicker position={mapPosition} onChange={setCoordinates} />
        </MapContainer>
      </div>

      {fields.length > 0 && (
        <div className="metadata-box">
          <div className="section-title">
            <div>
              <h3>Información de {category.toLowerCase()}</h3>
              <p>Estos campos cambian según la categoría seleccionada.</p>
            </div>
          </div>
          <div className="form-grid">
            {fields.map((field) =>
              field.type === "boolean" ? (
                <label key={field.key} className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={Boolean(metadata[field.key])}
                    onChange={(e) =>
                      setMetadata({
                        ...metadata,
                        [field.key]: e.target.checked,
                      })
                    }
                  />
                  {field.label}
                </label>
              ) : (
                <label key={field.key}>
                  {field.label}
                  <input
                    required={field.required}
                    min={
                      field.key === "room_count" || field.key === "ticket_price"
                        ? 0
                        : undefined
                    }
                    type={field.type}
                    value={String(metadata[field.key] ?? "")}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      setMetadata({
                        ...metadata,
                        [field.key]:
                          field.type === "number"
                            ? e.target.value === ""
                              ? ""
                              : Number(e.target.value)
                            : e.target.value,
                      })
                    }
                  />
                </label>
              ),
            )}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn primary" disabled={saving}>
          {saving
            ? "Guardando..."
            : initial
              ? "Guardar cambios"
              : "Crear lugar"}
        </button>
      </div>
    </form>
  );
}
