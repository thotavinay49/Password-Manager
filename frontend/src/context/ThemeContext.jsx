// src/context/ThemeContext.jsx
import { createContext, useContext, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const choose = (light, dark) => (theme === "dark" ? dark : light);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle, choose }}>
      {children}
    </ThemeContext.Provider>
  );
}
