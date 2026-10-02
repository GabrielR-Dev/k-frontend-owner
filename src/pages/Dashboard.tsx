import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  ArrowRight,
  CreditCard,
  XCircle,
} from "lucide-react";
import { ownerService } from "../services/owner.service";
import { planService } from "../services/plan.service";
import type { Dashboard as DashboardType, Plan } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { getApiError } from "../services/api";

export function Dashboard() {
  const [data, setData] = useState<DashboardType | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([ownerService.dashboard(), planService.me()])
      .then(([d, p]) => {
        setData(d);
        setPlan(p);
      })
      .catch((e) => setError(getApiError(e)));
  }, []);
  if (error) return <div className="error-box">{error}</div>;
  if (!data) return <div className="page-loading">Cargando dashboard...</div>;
  const stats = [
    {
      label: "Total de lugares",
      value: data.statistics?.totalPlaces ?? data.totalPlaces ?? 0,
      icon: MapPin,
      tone: "",
    },
    {
      label: "Aprobados",
      value: data.statistics?.approvedPlaces ?? data.approvedPlaces ?? 0,
      icon: CheckCircle2,
      tone: "green",
    },
    {
      label: "Pendientes",
      value: data.statistics?.pendingPlaces ?? data.pendingPlaces ?? 0,
      icon: Clock3,
      tone: "yellow",
    },
    {
      label: "Rechazados",
      value: data.statistics?.rejectedPlaces ?? data.rejectedPlaces ?? 0,
      icon: XCircle,
      tone: "red",
    },
  ];
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">RESUMEN</span>
          <h1>Hola, Owner 👋</h1>
          <p>Este es el estado actual de tus establecimientos.</p>
        </div>
        <Link to={plan ? "/places/new" : "/plans"} className="btn primary">
          <Plus size={18} /> Nuevo lugar
        </Link>
      </div>
      {!plan && (
        <div className="warning-box">
          <div>
            <strong>Seleccioná un plan para comenzar</strong>
            <div>
              Necesitás elegir un plan antes de poder administrar tus
              establecimientos.
            </div>
          </div>
          <Link to="/plans" className="text-link">
            Ver planes <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.tone}`}>
              <s.icon size={21} />
            </div>
            <div>
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="panel plan-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">PLAN ACTUAL</span>
              <h2>{plan?.name || plan?.code || "Sin plan seleccionado"}</h2>
            </div>
            <CreditCard size={24} />
          </div>
          <p>
            {plan?.description ||
              "Elegí un plan para comenzar a publicar tus establecimientos."}
          </p>
          <Link to="/plans" className="text-link">
            {plan ? "Administrar plan" : "Elegir un plan"}{" "}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="panel quick-panel">
          <span className="eyebrow">ESTADOS</span>
          <div className="status-line">
            <StatusBadge status="APPROVED" />
            <span>Ya visibles para turistas</span>
          </div>
          <div className="status-line">
            <StatusBadge status="PENDING" />
            <span>Esperando revisión del administrador</span>
          </div>
          <div className="status-line">
            <StatusBadge status="REJECTED" />
            <span>Revisá el motivo y corregí el lugar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
