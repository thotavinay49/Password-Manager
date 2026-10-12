// src/pages/Register.jsx

import { useState } from "react";
import { Shield, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

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
        </form>

        {stat.message && (
          <p
            className={`mt-4 text-center text-sm ${
              stat.error ? "text-red-600" : "text-green-600"
            }`}
          >
            {stat.message}
          </p>
        )}

        <p className={`mt-6 text-center text-sm ${choose("text-gray-600", "text-gray-400")}`}>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
