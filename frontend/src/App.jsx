// src/App.jsx
// src/App.jsx
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ThemeProvider from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

import AppRoutes from "./routes";
import RouteTracker from "./components/layout/RouteTracker";

export default function App() {
 

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <RouteTracker />
            <AppRoutes />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
