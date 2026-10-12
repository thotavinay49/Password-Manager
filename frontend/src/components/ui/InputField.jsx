// src/components/ui/InputField.jsx
import { User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function InputField({
  id,
  label,
  icon = User,
  value,
  onChange,
  placeholder = "",
  type = "text",
  autoComplete = "",
  className = "",
}) {
  const { choose } = useTheme();
  const Icon = icon;

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
        {Icon && (
          <Icon
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${choose(
              "text-gray-400",
              "text-gray-500"
            )}`}
          />
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full ${
            Icon ? "pl-10" : "pl-4"
          } pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 ${choose(
            "border border-gray-300",
            "bg-gray-700 text-gray-100 border border-gray-600"
          )} ${className}`}
        />
      </div>
    </div>
  );
}
