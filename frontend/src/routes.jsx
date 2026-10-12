// src/routes.jsx
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";

import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import PasswordGeneratorPage from "./pages/PasswordGeneratorPage";
import AdminPage from "./pages/AdminPage";

function Protected({ adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading…
      </div>
    );

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (adminOnly && user.role !== "ROLE_ADMIN")
    return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

function RouteWithToast({ element: Element, pageName, ...rest }) {
  const { show } = useToast();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    const isProtected =
      path !== "/login" &&
      path !== "/register" &&
      !path.startsWith("/admin"); // Avoid storing /admin routes for non-admins

    if (user && isProtected) {
      if (!path.startsWith("/admin") || user.role === "ROLE_ADMIN") {
        localStorage.setItem("lastPath", path);
      }
    }

    show(`Welcome to ${pageName} page, ${user?.username ?? "Guest"}`);
  }, [location.pathname, user?.username, user?.role, show, pageName]);

  return <Element {...rest} />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route
        path="/login"
        element={<RouteWithToast element={Login} pageName="Login" />}
      />
      <Route
        path="/register"
        element={<RouteWithToast element={Register} pageName="Register" />}
      />

      {/* Protected user routes */}
      <Route element={<Protected />}>
        <Route
          path="/dashboard"
          element={<RouteWithToast element={Dashboard} pageName="Dashboard" />}
        />
        <Route
          path="/settings"
          element={<RouteWithToast element={SettingsPage} pageName="Settings" />}
        />
        <Route
          path="/generator"
          element={
            <RouteWithToast
              element={PasswordGeneratorPage}
              pageName="Generator"
            />
          }
        />

        {/* Admin-only route */}
        <Route element={<Protected adminOnly />}>
          <Route
            path="/admin"
            element={<RouteWithToast element={AdminPage} pageName="Admin" />}
          />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
