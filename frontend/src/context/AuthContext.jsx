// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setAuth, clearAuth, api, getBaseURL } from "../services/api";
import {
  loginRequest,
  registerRequest,
  fetchRole,
  logoutRequest,
} from "../services/userService";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (loggedInUser !== "true" || !username) {
      setLoading(false);
      return;
    }

    if (token) {
      setAuth(token);
      setUser({ username, role: "ROLE_USER", isAdmin: false });
      fetchRole()
        .then((role) => {
          setUser({ username, role, isAdmin: role === "ROLE_ADMIN" });
        })
        .catch(() => {
          // Token might still be valid or fallback to user role
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      (async () => {
        try {
          const res = await api.post("/api/user/refresh");
          const refreshedToken = res.data?.token;
          if (refreshedToken) {
            setAuth(refreshedToken);
            const role = await fetchRole();
            setUser({ username, role, isAdmin: role === "ROLE_ADMIN" });
          } else {
            clearAuth();
            setUser(null);
          }
        } catch {
          clearAuth();
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [navigate, location.pathname]);

  const login = async (username, password) => {
    try {
      const res = await loginRequest(username, password);
      const token = res?.token;

      if (!token) {
        return {
          success: false,
          message:
            typeof res === "string"
              ? res
              : "Invalid server response (no token). Please check backend connection.",
        };
      }

      setAuth(token);

      localStorage.setItem("loggedInUser", "true");
      localStorage.setItem("username", username);

      try {
        const role = await fetchRole();
        setUser({ username, role, isAdmin: role === "ROLE_ADMIN" });
      } catch {
        setUser({ username, role: "ROLE_USER", isAdmin: false });
      }

      return { success: true, message: "Logged in successfully" };
    } catch (err) {
      const serverUrl = getBaseURL() || (typeof window !== "undefined" ? window.location.origin : "server");
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        (err.response?.status === 401 ? "Invalid username or password" : null) ||
        (err.response?.status === 503 ? err.response?.data?.message : null) ||
        `Unable to reach backend server at ${serverUrl}. Please ensure your Spring Boot backend is running on port 8080 (or check your API URL in settings).`;

      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const register = async (username, password) => {
    try {
      const msg = await registerRequest(username, password);
      return {
        success: true,
        message: typeof msg === "string" ? msg : "User registered successfully",
      };
    } catch (err) {
      const serverUrl = getBaseURL() || (typeof window !== "undefined" ? window.location.origin : "server");
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        (err.response?.status === 409
          ? "Username is already taken. Please choose another."
          : null) ||
        (err.response?.status === 400
          ? "Registration failed. Invalid username or password."
          : null) ||
        (err.response?.status === 503
          ? err.response?.data?.message || "Backend server or database is currently unavailable."
          : null) ||
        `Unable to reach backend server at ${serverUrl}. Please verify the backend is running.`;

      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      console.warn("⚠️ Backend logout failed or already logged out");
    }

    clearAuth();
    setUser(null);
    localStorage.removeItem("lastPath");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
