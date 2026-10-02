import type { PlaceStatus } from "../types";

const config: Record<PlaceStatus, { label: string; className: string }> = {
  DRAFT: { label: "Borrador", className: "status pending" },
  PENDING: { label: "Pendiente", className: "status pending" },
  APPROVED: { label: "Aprobado", className: "status approved" },
  REJECTED: { label: "Rechazado", className: "status rejected" },
};

export function StatusBadge({ status }: { status: PlaceStatus }) {
  const item = config[status] || config.PENDING;
  return <span className={item.className}>{item.label}</span>;
}
