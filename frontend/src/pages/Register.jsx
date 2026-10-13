// src/pages/Register.jsx

import { useState } from "react";
import { Shield, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getBaseURL, setDemoMode } from "../services/api";

import InputField from "../components/ui/InputField";
import PasswordField from "../components/ui/PasswordField";
import Button from "../components/ui/Button";

export default function Register() {
  const { register } = useAuth();
  const { choose } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [stat, setStat] = useState({ loading: false, message: "", error: false });

  const handleChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const submit = async (e) => {
    e.preventDefault();
    setStat({ loading: true, message: "", error: false });
    const res = await register(form.username.trim(), form.password);
    setStat({ loading: false, message: res.message, error: !res.success });
    if (res.success) navigate("/login");
  };

  const btnCls = `
    w-full py-3 rounded-lg text-white disabled:opacity-50 transition
    ${choose(
      "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700",
      "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500"
    )}
  `;

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 bg-gradient-to-br ${choose(
        "from-indigo-600 via-violet-600 to-fuchsia-500",
        "from-gray-950 via-indigo-950 to-purple-950"
      )}`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${choose(
          "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 border border-white/40",
          "bg-gradient-to-br from-gray-800 via-indigo-950 to-purple-950 border border-indigo-800"
        )}`}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-3xl font-bold ${choose("text-gray-900", "text-gray-100")}`}>
            Create Account
          </h2>
        </div>

        <form className="space-y-6" onSubmit={submit}>
          <InputField
            id="username"
            label="Username"
            icon={User}
            value={form.username}
            onChange={(v) => handleChange("username", v)}
            placeholder="Choose a username"
            autoComplete="username"
            className={choose(
              "bg-indigo-50 text-gray-900 border-indigo-200 placeholder:text-gray-500",
              "border-indigo-700 placeholder:text-gray-400"
            )}
          />

          <PasswordField
            id="password"
            value={form.password}
            onChange={(v) => handleChange("password", v)}
            placeholder="Create a strong password"
            autoComplete="new-password"
            className={choose(
              "bg-indigo-50 text-gray-900 border-indigo-200 placeholder:text-gray-500",
              "border-indigo-700 placeholder:text-gray-400"
            )}
          />

          <Button type="submit" loading={stat.loading} className={btnCls}>
            {stat.loading ? "Creating…" : "Create Account"}
          </Button>

          <button
            type="button"
            onClick={async () => {
              setDemoMode(true);
              const userToRegister = form.username.trim() || "demo";
              const passToRegister = form.password || "Password123!";
              await register(userToRegister, passToRegister);
              navigate("/login");
            }}
            className="w-full py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white/70 dark:bg-slate-900/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            ⚡ Test in Instant Demo Vault (No Backend Needed)
          </button>
        </form>

        {stat.message && (
          <div className="mt-4 text-center">
            <p
              className={`text-sm font-medium ${
                stat.error ? "text-red-500" : "text-green-500"
              }`}
            >
              {stat.message}
            </p>
            {stat.error && (stat.message.toLowerCase().includes("taken") || stat.message.toLowerCase().includes("already")) && (
              <Link to="/login" className="text-xs text-blue-500 hover:underline mt-1.5 inline-block font-medium">
                This username is already registered. Click here to Sign In →
              </Link>
            )}
            {stat.error && (stat.message.toLowerCase().includes("unable to reach") || stat.message.toLowerCase().includes("intercepted") || stat.message.toLowerCase().includes("unavailable")) && (
              <button
                type="button"
                onClick={() => {
                  setDemoMode(true);
                  window.location.reload();
                }}
                className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline block mx-auto"
              >
                👉 Click here to activate Instant Demo Vault (Runs in browser with 0 errors)
              </button>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200/40 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
          <button
            type="button"
            onClick={() => {
              const current = localStorage.getItem("backend_url") || "";
              const active = getBaseURL() || "http://localhost:8080";
              const url = window.prompt(
                `Current backend URL: ${active}\n\nEnter backend URL (e.g. http://localhost:8080 or your cloud URL).\nLeave empty to use default:`,
                current
              );
              if (url !== null) {
                if (url.trim()) localStorage.setItem("backend_url", url.trim().replace(/\/+$/, ""));
                else localStorage.removeItem("backend_url");
                window.location.reload();
              }
            }}
            className="text-slate-400 hover:text-indigo-500 underline flex items-center gap-1"
            title="Configure backend server URL"
          >
            ⚙️ API: {getBaseURL() || "Localhost"}
          </button>
        </div>
      </div>
    </div>
  );
}
