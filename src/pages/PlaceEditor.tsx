import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlaceForm } from "../components/PlaceForm";
import { ownerService } from "../services/owner.service";
import { planService } from "../services/plan.service";
import type { Place, PlacePayload, Plan } from "../types";
import { getApiError } from "../services/api";

export function PlaceEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | undefined>();
  const [categories, setCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      planService.me(),
      id ? ownerService.getPlace(id) : Promise.resolve(undefined),
    ])
      .then(([plan, p]) => {
        setPlace(p);
        const normalize = (code: string) =>
          code === "COMMERCE"
            ? "SHOP"
            : code === "ATTRACTION"
              ? "TOURIST_ATTRACTION"
              : code;
        const codes = plan?.code
          ? [normalize(plan.code)]
          : [
              "GENERAL",
              "RESTAURANT",
              "HOTEL",
              "MUSEUM",
              "TOURIST_ATTRACTION",
              "SHOP",
            ];
        setCategories(codes);
      })
      .catch((e) => setError(getApiError(e)));
  }, [id]);
  const submit = async (payload: PlacePayload) => {
    setSaving(true);
    setError("");
    try {
      if (id) await ownerService.updatePlace(id, payload);
      else await ownerService.createPlace(payload);
      navigate("/places");
    } catch (e) {
      setError(getApiError(e, "No se pudo guardar el lugar."));
    } finally {
      setSaving(false);
    }
  };
  if (id && !place && !error)
    return <div className="page-loading">Cargando lugar...</div>;
  return (
    <div className="page">
      {error && <div className="error-box">{error}</div>}
      <PlaceForm
        initial={place}
        categories={categories}
        onSubmit={submit}
        onCancel={() => navigate("/places")}
        saving={saving}
      />
    </div>
  );
}
