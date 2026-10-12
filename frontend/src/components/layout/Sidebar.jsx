// src/components/layout/Sidebar.jsx

import {
  Key,
  RefreshCw,
  Settings,
  Shield,
  ShieldAlert,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

export default function Sidebar({ active, onSelect }) {
  const { user, logout }   = useAuth();
  const { choose }         = useTheme();
  const navigate           = useNavigate();
  const location           = useLocation();
  const { show }           = useToast();

  const nav = [
    ["credentials", "My Passwords", Key],
    ["generator",   "Generator",    RefreshCw],
    ["settings",    "Settings",     Settings],
    ...(user.isAdmin ? [["admin", "Admin", ShieldAlert]] : []),
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 shadow-lg ${choose("bg-white","bg-gray-800")}`}>
      <div className="flex flex-col h-full">
        <div className={`flex items-center space-x-3 p-6 ${choose("border-b border-gray-100","border-b border-gray-700")}`}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${choose("text-gray-900","text-gray-100")}`}>SecureVault</h1>
            <p className={choose("text-xs text-gray-600","text-xs text-gray-400")}>Password Manager</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {nav.map(([id, label, Icon]) => {
            const isActive  = active === id;
            const activeCSS = choose(
              "bg-blue-50 text-blue-600 border-r-2 border-blue-600",
              "bg-blue-900/30 text-blue-300 border-r-2 border-blue-600/50"
            );
            const idleCSS   = choose("text-gray-600 hover:bg-gray-50", "text-gray-300 hover:bg-gray-700");
            const route     = id === "credentials" ? "/dashboard" : `/${id}`;

            const handleClick = () => {
              show(`Welcome to ${label} page, ${user?.username || "Guest"}`);
              if (location.pathname === route) return;
              if (onSelect && (id === "credentials" || id === "generator")) onSelect(id);
              else navigate(route);
            };

            return (
              <button
                key={id}
                onClick={handleClick}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive ? activeCSS : idleCSS
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className={`p-4 ${choose("border-t","border-t border-gray-700")}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${choose("bg-gray-300","bg-gray-600")}`}>
                <User className={choose("w-4 h-4 text-gray-600","w-4 h-4 text-gray-300")} />
              </div>
              <div>
                <p className={`text-sm font-medium ${choose("text-gray-900","text-gray-100")}`}>{user.username}</p>
                <p className={choose("text-xs text-gray-600","text-xs text-gray-400")}>{user.isAdmin ? "Admin" : "User"}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className={choose(
                "p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg",
                "p-2 text-gray-400 hover:text-red-600 hover:bg-red-900/20 rounded-lg"
              )}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
