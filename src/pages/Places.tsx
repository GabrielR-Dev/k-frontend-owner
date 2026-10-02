import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ownerService } from "../services/owner.service";
import type { Place, PlaceStatus } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { Modal } from "../components/Modal";
import { getApiError } from "../services/api";

export function Places() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | PlaceStatus>("ALL");
  const [selected, setSelected] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const load = () =>
    ownerService
      .places()
      .then(setPlaces)
      .catch((e) => setError(getApiError(e)))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const filtered = useMemo(
    () =>
      places.filter(
        (p) =>
          (status === "ALL" || p.status === status) &&
          `${p.name} ${p.category} ${p.address}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [places, status, query],
  );
  const remove = async () => {
    if (!selected) return;
    try {
      await ownerService.deletePlace(selected.id);
      setSelected(null);
      load();
    } catch (e) {
      setError(getApiError(e));
    }
  };
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ESTABLECIMIENTOS</span>
          <h1>Mis lugares</h1>
          <p>Administrá tus publicaciones y su estado de revisión.</p>
        </div>
        <Link to="/places/new" className="btn primary">
          <Plus size={18} /> Nuevo lugar
        </Link>
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, categoría o dirección..."
          />
        </div>
        <div className="filters">
          {(["ALL", "APPROVED", "PENDING", "REJECTED"] as const).map((s) => (
            <button
              key={s}
              className={status === s ? "filter active" : "filter"}
              onClick={() => setStatus(s)}
            >
              {s === "ALL"
                ? "Todos"
                : s === "APPROVED"
                  ? "Aprobados"
                  : s === "PENDING"
                    ? "Pendientes"
                    : "Rechazados"}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="page-loading">Cargando lugares...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <MapPinIcon />
          <h3>No hay lugares para mostrar</h3>
          <p>Probá con otro filtro o creá tu primer establecimiento.</p>
        </div>
      ) : (
        <div className="places-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lugar</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Dirección</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <small>#{p.id}</small>
                  </td>
                  <td>{p.category}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>{p.address || "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        title="Ver"
                        onClick={() => navigate(`/places/${p.id}`)}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        title="Editar"
                        onClick={() => navigate(`/places/${p.id}/edit`)}
                      >
                        <Pencil size={17} />
                      </button>
                      <button title="Eliminar" onClick={() => setSelected(p)}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={!!selected}
        title="Eliminar lugar"
        onClose={() => setSelected(null)}
      >
        <p>
          ¿Seguro que querés eliminar <b>{selected?.name}</b>? Esta acción
          realiza una eliminación lógica.
        </p>
        <div className="form-actions">
          <button className="btn secondary" onClick={() => setSelected(null)}>
            Cancelar
          </button>
          <button className="btn danger" onClick={remove}>
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
function MapPinIcon() {
  return <Plus size={30} />;
}
