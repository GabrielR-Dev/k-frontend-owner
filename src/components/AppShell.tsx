import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  CreditCard,
  UserCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/places", label: "Mis lugares", icon: MapPin },
    { to: "/plans", label: "Mi plan", icon: CreditCard },
    { to: "/profile", label: "Mi perfil", icon: UserCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>
          <span>kiago</span>
          <button
            className="icon-btn mobile-close"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="owner-label">PANEL DEL DUEÑO</div>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {(user?.name || user?.firstName || user?.email || "O")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <strong>{user?.name || user?.firstName || "Owner"}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <div>
            <strong>Panel de control</strong>
            <span>Gestioná tus establecimientos en Kiago</span>
          </div>
          <div className="topbar-avatar">
            {(user?.name || user?.firstName || "O").charAt(0).toUpperCase()}
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
