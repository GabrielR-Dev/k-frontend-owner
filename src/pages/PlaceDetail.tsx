import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ownerService } from "../services/owner.service";
import type { Place } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { getApiError } from "../services/api";

export function PlaceDetail() {
  const { id } = useParams();
  const [place, setPlace] = useState<Place | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    ownerService
      .getPlace(id!)
      .then(setPlace)
      .catch((e) => setError(getApiError(e)));
  }, [id]);
  if (error) return <div className="error-box">{error}</div>;
  if (!place) return <div className="page-loading">Cargando...</div>;
  const reason = place.rejection_reason || place.rejectionReason;
  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  return (
    <div className="page">
      <Link to="/places" className="back-link">
        <ArrowLeft size={17} /> Volver a mis lugares
      </Link>
      <div className="detail-head">
        <div>
          <span className="eyebrow">{place.category}</span>
          <h1>{place.name}</h1>
          <p>{place.description}</p>
        </div>
        <div className="detail-actions">
          <StatusBadge status={place.status} />
          <Link to={`/places/${place.id}/edit`} className="btn secondary">
            <Pencil size={17} /> Editar
          </Link>
        </div>
      </div>
      {reason && (
        <div className="rejection-box">
          <strong>Motivo del rechazo</strong>
          <p>{reason}</p>
        </div>
      )}
      <div className="detail-grid">
        <section className="panel">
          <h3>Información general</h3>
          <div className="detail-list">
            <div>
              <span>Dirección</span>
              <b>{place.address || "—"}</b>
            </div>
            <div>
              <span>Coordenadas</span>
              <b>
                {place.latitude ?? "—"}, {place.longitude ?? "—"}
              </b>
            </div>
            <div>
              <span>Creado</span>
              <b>
                {place.createdAt
                  ? new Date(place.createdAt).toLocaleDateString("es-AR")
                  : "—"}
              </b>
            </div>
          </div>
        </section>
        <section className="panel">
          <h3>Metadata</h3>
          <pre className="json-view">
            {JSON.stringify(place.metadata || {}, null, 2)}
          </pre>
        </section>
      </div>
      {hasCoordinates ? (
        <div className="map-placeholder map-container">
          <MapContainer
            center={[latitude, longitude]}
            zoom={15}
            scrollWheelZoom={false}
            className="place-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]}>
              <Popup>
                <strong>{place.name}</strong>
                {place.address && <div>{place.address}</div>}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      ) : (
        <div className="map-placeholder">
          <span>Este lugar no tiene coordenadas disponibles.</span>
        </div>
      )}
    </div>
  );
}
