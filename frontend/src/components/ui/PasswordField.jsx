// src/components/ui/PasswordField.jsx
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function PasswordField({
  id = "password",
  label = "Password",
  value,
  onChange,
  autoComplete = "current-password",
  placeholder = "Enter password",
  className = "",
}) {
  const [show, setShow] = useState(false);
  const { choose } = useTheme();

  return (
    <div>
      <label
        htmlFor={id}
        className={`block mb-2 text-sm font-medium ${choose(
          "text-gray-700",
          "text-gray-300"
        )}`}
      >
        {label}
      </label>

      <div className="relative">
        <Lock
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${choose(
            "text-gray-400",
            "text-gray-500"
          )}`}
        />

        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full pl-10 pr-12 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 ${choose(
            "border border-gray-300",
            "bg-gray-700 text-gray-100 border border-gray-600"
          )} ${className}`}
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${choose(
            "text-gray-400",
            "text-gray-500"
          )}`}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
