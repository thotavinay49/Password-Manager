// src/components/credential/CredentialCard.jsx
import { useState } from "react";
import { Copy, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";
import StrengthBadge from "./StrengthBadge";

export default function CredentialCard({
  credential,
  onEdit,
  onDelete,
  edited = false,
  highlight = false,
  setHoveredId = () => {},
}) {
  const { choose }      = useTheme();
  const [showPw, setPw] = useState(false);
  const [copied, copy]  = useCopyToClipboard();

  const score        = Number(
    credential.pswdStrength?.find((s) => s.startsWith("score:"))?.split(":")[1] ?? 0
  );
  const borderColors = [
    "border-red-500",
    "border-orange-500",
    "border-yellow-500",
    "border-green-500",
    "border-blue-600",
  ];
  const borderClass  = borderColors[score] ?? borderColors[1];

  return (
    <div
      onMouseEnter={() => setHoveredId(credential.id)}
      onMouseLeave={() => setHoveredId(null)}
      className={`group cursor-pointer rounded-xl p-6 border-2 ${borderClass}
        transform transition-all duration-200 hover:scale-105 hover:shadow-lg
        ${highlight ? "ring-2 ring-blue-400" : ""}
        ${choose("bg-white hover:bg-gray-50", "bg-gray-800 hover:bg-gray-700")}
      `}
    >
      {/* top row */}
      <div className="flex items-start justify-between mb-4">
        {/* service + username */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {credential.serviceName[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className={`font-semibold ${choose("text-gray-900","text-gray-100")}`}>
              {credential.serviceName}
            </h3>
            <p className={choose("text-sm text-gray-600","text-sm text-gray-400")}>
              {credential.username}
            </p>
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center space-x-2 relative">
          {/* copy */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); copy(credential.password); }}
              title="Copy"
              className={choose(
                "p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg",
                "p-2 text-gray-400 hover:text-green-500 hover:bg-green-900/20 rounded-lg"
              )}
            >
              <Copy className="w-4 h-4" />
            </button>
            {copied && (
              <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 text-xs rounded-md
                ${choose("bg-green-600 text-white","bg-green-500 text-white")}`}>
                Copied!
              </div>
            )}
          </div>

          {/* edit */}
          <div className="relative flex flex-col items-center">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(credential); }}
              title="Edit"
              className={choose(
                "p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg",
                "p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-900/20 rounded-lg"
              )}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {edited && (
              <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 text-xs rounded-md
                ${choose("bg-blue-600 text-white","bg-blue-500 text-white")}`}>
                Edited
              </div>
            )}
          </div>

          {/* delete */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(credential.id); }}
            title="Delete"
            className={choose(
              "p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg",
              "p-2 text-gray-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg"
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* password row */}
      <div className={`flex items-center justify-between font-mono text-sm ${choose("text-gray-800","text-gray-300")}`}>
        <span>Password:</span>
        <div className="flex items-center space-x-2">
          <span>{showPw ? credential.password : "••••••••"}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setPw(!showPw); }}
            className={choose("text-gray-400 hover:text-gray-600","text-gray-400 hover:text-gray-200")}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* strength */}
      <div className="mt-4">
        <StrengthBadge strengthArr={credential.pswdStrength} />
      </div>
    </div>
  );
}
