import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getApiError } from "../services/api";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(getApiError(err, "Email o contraseña incorrectos."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Gestioná tus lugares turísticos desde un solo lugar."
    >
      <form onSubmit={submit} className="auth-form">
        {error && <div className="error-box">{error}</div>}
        <label>
          Email
          <div className="input-icon">
            <Mail size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>
        </label>
        <label>
          Contraseña
          <div className="input-icon">
            <LockKeyhole size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
        </label>
        <button className="btn primary wide" disabled={loading}>
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
        <p className="auth-switch">
          ¿Todavía no tenés cuenta?{" "}
          <Link to="/register">Crear cuenta de Owner</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="visual-brand">
          <div className="brand-mark">
            <Sparkles size={19} />
          </div>
          kiago
        </div>
        <div className="visual-copy">
          <span>PARA DUEÑOS</span>
          <h1>
            Tu lugar.
            <br />
            Tu experiencia.
            <br />
            <em>Tu público.</em>
          </h1>
          <p>
            Publicá y administrá tus establecimientos turísticos con una
            experiencia simple y profesional.
          </p>
        </div>
        <div className="visual-pin">
          <MapPin size={22} />
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-content">
          <div className="mobile-brand">
            <div className="brand-mark">
              <Sparkles size={18} />
            </div>
            kiago
          </div>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
