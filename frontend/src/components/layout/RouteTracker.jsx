// src/components/layout/RouteTracker.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("lastPath", location.pathname);
  }, [location.pathname]);

  return null;
}
