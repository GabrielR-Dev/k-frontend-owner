import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Places } from "./pages/Places";
import { PlaceEditor } from "./pages/PlaceEditor";
import { PlaceDetail } from "./pages/PlaceDetail";
import { Plans } from "./pages/Plans";
import { Profile } from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="/places" element={<Places />} />
              <Route path="/places/new" element={<PlaceEditor />} />
              <Route path="/places/:id" element={<PlaceDetail />} />
              <Route path="/places/:id/edit" element={<PlaceEditor />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
