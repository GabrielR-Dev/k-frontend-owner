import { useEffect, useState } from "react";
import { Check, CreditCard } from "lucide-react";
import { planService } from "../services/plan.service";
import type { Plan } from "../types";
import { getApiError } from "../services/api";

export function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const [p, c] = await Promise.all([planService.list(), planService.me()]);
      setPlans(p);
      setCurrent(c);
    } catch (e) {
      setError(getApiError(e, "No se pudieron cargar los planes."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const select = async (code: string) => {
    setSelecting(code);
    setError("");
    try {
      await planService.select(code);
      await load();
    } catch (e) {
      setError(getApiError(e, "No se pudo seleccionar el plan."));
    } finally {
      setSelecting("");
    }
  };

  if (loading) {
    return <div className="page-loading">Cargando planes...</div>;
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PLANES</span>
          <h1>Elegí cómo publicar</h1>
          <p>
            Tu plan determina la categoría y límite de establecimientos que
            podés administrar.
          </p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="current-plan">
        {current ? (
          <>
            <div className="plan-icon">
              <CreditCard size={22} />
            </div>
            <div>
              <span>PLAN ACTUAL</span>
              <strong>{current.name || current.code}</strong>
              {current.maxPlaces !== undefined && (
                <small
                  style={{
                    display: "block",
                    color: "var(--muted)",
                    marginTop: "2px",
                  }}
                >
                  Máximo de establecimientos: {current.maxPlaces}
                </small>
              )}
            </div>
            <span className="current-ok">
              <Check size={16} /> Activo
            </span>
          </>
        ) : (
          <>
            <div className="plan-icon">
              <CreditCard size={22} />
            </div>
            <div>
              <span>SIN PLAN</span>
              <strong>
                Elegí un plan para comenzar a administrar establecimientos
              </strong>
            </div>
          </>
        )}
      </div>

      <div className="section-heading">
        <div>
          <span className="eyebrow">CATÁLOGO</span>
          <h2>Todos los planes disponibles</h2>
        </div>
      </div>

      <div className="plan-grid">
        {plans.map((p) => {
          const active = current?.code === p.code;
          return (
            <div
              className={`plan-card ${active ? "selected" : ""}`}
              key={p.code}
            >
              <div className="plan-card-head">
                <div>
                  <span className="eyebrow">KIAGO</span>
                  <h2>{p.name || p.code}</h2>
                </div>
                {active && <span className="selected-pill">ACTUAL</span>}
              </div>
              <p>
                {p.description ||
                  `Plan para administrar establecimientos de categoría ${p.code} en Kiago.`}
              </p>

              {p.maxPlaces !== undefined && (
                <div className="plan-feature">
                  <Check size={17} /> Hasta {p.maxPlaces} establecimientos
                </div>
              )}
              <div className="plan-feature">
                <Check size={17} /> Categoría {p.code}
              </div>

              <button
                className={`btn ${active ? "secondary" : "primary"} wide`}
                disabled={active || selecting === p.code}
                onClick={() => select(p.code)}
              >
                {selecting === p.code
                  ? "Aplicando..."
                  : active
                    ? "Plan seleccionado"
                    : "Seleccionar plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
