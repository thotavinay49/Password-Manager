// src/context/ToastContext.jsx
import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import Toast from "../components/ui/Toast";

const LOCAL_KEY = "sv_notify_enabled";
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  /** toast = { id, text, type } */
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  /* notification master‑switch */
  const [enabled, setEnabled] = useState(
    () => JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "true")
  );

  useEffect(
    () => localStorage.setItem(LOCAL_KEY, JSON.stringify(enabled)),
    [enabled]
  );

  
  const show = useCallback(
    (msg, ms = 4000, type = "info", force = false) => {
      if (!enabled && !force) return;

      clearTimeout(timer.current);

      /* unique id guarantees re‑mount → animation always plays */
      setToast({ id: Date.now(), text: msg, type });

      timer.current = setTimeout(() => setToast(null), ms);
    },
    [enabled]
  );

  return (
    <ToastContext.Provider value={{ show, enabled, setEnabled }}>
      {children}
      <Toast toast={toast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};
