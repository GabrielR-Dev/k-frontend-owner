import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, LockKeyhole, User, Phone, UserRoundCheck } from "lucide-react";
import { AuthLayout } from "./Login";
import { useAuth } from "../context/AuthContext";
import { getApiError } from "../services/api";
import type { Role } from "../types";

export function Register() {
  const [form, setForm] = useState<{
    name: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirm: string;
    role: Role;
  }>({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    role: "OWNER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm)
      return setError("Las contraseñas no coinciden.");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(getApiError(err, "No se pudo crear la cuenta."));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout
      title="Creá tu cuenta"
      subtitle="Elegí el rol de la cuenta y completá tus datos."
    >
      <form onSubmit={submit} className="auth-form">
        {error && <div className="error-box">{error}</div>}
        <div className="form-grid compact">
          <label>
            Nombre
            <div className="input-icon">
              <User size={17} />
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>
          </label>
          <label>
            Apellido
            <input
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </label>
          <label className="full">
            Email
            <div className="input-icon">
              <Mail size={17} />
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>
          </label>
          <label className="full">
            Teléfono
            <div className="input-icon">
              <Phone size={17} />
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </label>
          <label className="full">
            Rol
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              required
            >
              <option value="OWNER">OWNER - Dueño de establecimiento</option>
              <option value="TOURIST">TOURIST - Turista</option>
              <option value="ADMIN">ADMIN - Administrador</option>
            </select>
          </label>
          <label>
            Contraseña
            <div className="input-icon">
              <LockKeyhole size={17} />
              <input
                type="password"
                minLength={6}
                maxLength={72}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
            </div>
          </label>
          <label>
            Repetir contraseña
            <div className="input-icon">
              <UserRoundCheck size={17} />
              <input
                type="password"
                minLength={6}
                maxLength={72}
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                required
              />
            </div>
          </label>
        </div>
        <div className="role-info">
          <strong>Rol seleccionado:</strong> {form.role}
        </div>
        <button className="btn primary wide" disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
        <p className="auth-switch">
          ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
