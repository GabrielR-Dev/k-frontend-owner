import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";
import { getApiError } from "../services/api";

export function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
    });
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile(form);
      const updatedUser = await authService.me();
      updateUser(updatedUser);
      setMessage("Perfil actualizado correctamente.");
      setError("");
      setEditing(false);
    } catch (e) {
      setError(getApiError(e));
    }
  };
  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.changePassword(
        passwords.currentPassword,
        passwords.newPassword,
      );
      setMessage("Contraseña actualizada.");
      setError("");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (e) {
      setError(getApiError(e));
    }
  };
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CUENTA</span>
          <h1>Mi perfil</h1>
          <p>Actualizá tus datos personales y contraseña.</p>
        </div>
      </div>
      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}
      <div className="profile-grid">
        <form className="form-card" onSubmit={saveProfile}>
          <div className="profile-card-heading">
            <h3>Datos personales</h3>
            {!editing && (
              <button
                className="btn secondary"
                type="button"
                onClick={() => setEditing(true)}
              >
                <Pencil size={16} /> Editar
              </button>
            )}
          </div>
          {editing ? (
            <div className="form-grid">
              <label>
                Nombre
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Apellido
                <input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  required
                />
              </label>
              <label className="full">
                Email
                <input value={user?.email || ""} disabled />
              </label>
              <label className="full">
                Teléfono
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>
            </div>
          ) : (
            <div className="profile-details">
              <div>
                <span>Nombre</span>
                <strong>{form.name || "Sin especificar"}</strong>
              </div>
              <div>
                <span>Apellido</span>
                <strong>{form.lastName || "Sin especificar"}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{user?.email || "Sin especificar"}</strong>
              </div>
              <div>
                <span>Teléfono</span>
                <strong>{form.phone || "Sin especificar"}</strong>
              </div>
            </div>
          )}
          {editing && (
            <div className="form-actions">
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setForm({
                    name: user?.name || user?.firstName || "",
                    lastName: user?.lastName || "",
                    phone: user?.phone || "",
                  });
                  setEditing(false);
                }}
              >
                <X size={16} /> Cancelar
              </button>
              <button className="btn primary" type="submit">
                Guardar cambios
              </button>
            </div>
          )}
        </form>
        <form className="form-card" onSubmit={savePassword}>
          <h3>Seguridad</h3>
          <div className="form-grid">
            <label className="full">
              Contraseña actual
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
              />
            </label>
            <label className="full">
              Nueva contraseña
              <input
                type="password"
                minLength={8}
                required
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
              />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn secondary">Cambiar contraseña</button>
          </div>
        </form>
      </div>
    </div>
  );
}
