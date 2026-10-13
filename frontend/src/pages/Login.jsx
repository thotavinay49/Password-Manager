// src/pages/Login.jsx
import { useState } from "react";
import { Shield, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getBaseURL, setDemoMode } from "../services/api";

import InputField from "../components/ui/InputField";
import PasswordField from "../components/ui/PasswordField";
import Button from "../components/ui/Button";

export default function Login() {
  const { login } = useAuth();
  const { choose } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [stat, setStat] = useState({ loading: false, message: "", error: false });

  const submit = async (e) => {
    e.preventDefault();
    setStat({ loading: true, message: "", error: false });
    const res = await login(form.username.trim(), form.password);
    setStat({ loading: false, message: res.message, error: !res.success });
    if (res.success) navigate("/dashboard");
  };

  const btnCls = `
    w-full py-3 rounded-lg text-white disabled:opacity-50 transition
    ${choose(
      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500"
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-3xl font-bold ${choose("text-gray-900", "text-gray-100")}`}>
            Welcome Back
          </h2>
          <p className={choose("text-gray-600", "text-gray-400")}>
            Sign in to your SecurePasswordManagerSystem account
          </p>
        </div>

        <form className="space-y-6" onSubmit={submit}>
          <InputField
            id="username"
            label="Username"
            icon={User}
            value={form.username}
            onChange={(v) => setForm({ ...form, username: v })}
            placeholder="Enter username"
            autoComplete="username"
            className={choose(
              "bg-indigo-50 text-gray-900 border-indigo-200 placeholder:text-gray-500",
              "border-indigo-700 placeholder:text-gray-400"
            )}
          />

          <PasswordField
            id="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            className={choose(
              "bg-indigo-50 text-gray-900 border-indigo-200 placeholder:text-gray-500",
              "border-indigo-700 placeholder:text-gray-400"
            )}
          />

          <Button type="submit" loading={stat.loading} className={btnCls}>
            Sign In
          </Button>

          <button
            type="button"
            onClick={async () => {
              setDemoMode(true);
              const res = await login("demo", "Password123!");
              if (res.success) navigate("/");
            }}
            className="w-full py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white/70 dark:bg-slate-900/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            ⚡ Test in Instant Demo Vault (demo / Password123!)
          </button>
        </form>

        {stat.message && (
          <div className="mt-4">
            <p
              className={`text-center text-sm ${
                stat.error ? "text-red-600 font-medium" : "text-green-500"
              }`}
            >
              {stat.message}
            </p>
            {stat.error && (stat.message.toLowerCase().includes("unable to reach") || stat.message.toLowerCase().includes("intercepted") || stat.message.toLowerCase().includes("unavailable")) && (
              <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">🛠️ Connection Options:</p>
                <p>1. <strong>Localhost:</strong> Start Spring Boot backend in <code>backend/</code> via <code>.\mvnw.cmd spring-boot:run</code></p>
                <p>2. <strong>Vercel Preview:</strong> Click the button below to test with zero setup:</p>
                <button
                  type="button"
                  onClick={async () => {
                    setDemoMode(true);
                    const res = await login("demo", "Password123!");
                    if (res.success) navigate("/");
                  }}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
                >
                  🚀 Launch Instant Demo Vault
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200/40 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <p>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Sign up
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
