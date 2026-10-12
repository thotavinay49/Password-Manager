// src/components/ui/Switches.jsx
import { Sun, Moon, Bell, BellOff } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeSwitch() {
  const { theme, toggle } = useTheme();
  const checked = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={toggle}
      className={`relative inline-flex h-6 w-12 rounded-full transition-colors ${
        checked ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : ""
        }`}
      >
        {checked ? (
          <Moon className="h-3.5 w-3.5 text-gray-700" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-yellow-400" />
        )}
      </span>
    </button>
  );
}

export function NotificationSwitch({ checked, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-12 rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : ""
        }`}
      >
        {checked ? (
          <Bell className="h-3.5 w-3.5 text-gray-700" />
        ) : (
          <BellOff className="h-3.5 w-3.5 text-gray-700" />
        )}
      </span>
    </button>
  );
}
