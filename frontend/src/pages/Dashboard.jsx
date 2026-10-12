// src/pages/Dashboard.jsx
import {
  Plus,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Filter,
  Server,
  ArrowUpDown,
  Sparkles,
  Lock,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import CredentialCard from "../components/credential/CredentialCard";
import CredentialModal from "../components/credential/CredentialModal";
import StrengthRing from "../components/credential/StrengthRing";
import Button from "../components/ui/Button";

import * as credSvc from "../services/credentialService";
import { getBaseURL } from "../services/api";

export default function Dashboard() {
  const { choose } = useTheme();
  const { user } = useAuth();

  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all, strong, weak
  const [sortBy, setSortBy] = useState("newest"); // newest, az, strength
  const [deleteId, setDeleteId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [recentlyEditedId, setRecentlyEditedId] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customBackendUrl, setCustomBackendUrl] = useState(
    localStorage.getItem("backend_url") || import.meta.env.VITE_BACKEND_URL || ""
  );

  const activeBackendUrl = getBaseURL() || "Local Proxy (http://localhost:8080)";

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const data = await credSvc.fetchAll();
      setCredentials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to fetch credentials:", err);
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  };

  const save = async (obj) => {
    let saved;
    if (edit) {
      const data = await credSvc.updateOne(edit.id, obj);
      setCredentials((prev) => prev.map((c) => (c.id === edit.id ? data : c)));
      saved = data;
    } else {
      const data = await credSvc.addOne(obj);
      setCredentials((prev) => [data, ...prev]);
      saved = data;
    }
    setRecentlyEditedId(saved.id);
    setTimeout(() => setRecentlyEditedId(null), 2500);
    setModal(false);
    setEdit(null);
  };

  const confirmDel = (id) => setDeleteId(id);
  const cancelDel = () => setDeleteId(null);
  const proceedDel = async () => {
    try {
      await credSvc.deleteOne(deleteId);
      setCredentials((prev) => prev.filter((c) => c.id !== deleteId));
    } finally {
      setDeleteId(null);
    }
  };

  const handleSaveBackendUrl = () => {
    const trimmed = customBackendUrl.trim().replace(/\/+$/, "");
    if (trimmed) {
      localStorage.setItem("backend_url", trimmed);
    } else {
      localStorage.removeItem("backend_url");
    }
    setShowConfigModal(false);
    window.location.reload();
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const total = credentials.length;
    let strongCount = 0;
    let weakCount = 0;

    credentials.forEach((c) => {
      const score = Number(
        c.pswdStrength?.find((t) => t.startsWith("score:"))?.split(":")[1] ?? 0
      );
      if (score >= 3) strongCount++;
      else if (score <= 1) weakCount++;
    });

    const healthScore = total > 0 ? Math.round((strongCount / total) * 100) : 100;
    return { total, strongCount, weakCount, healthScore };
  }, [credentials]);

  // Filtered & Sorted Credentials
  const filteredCredentials = useMemo(() => {
    let result = Array.isArray(credentials) ? [...credentials] : [];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.serviceName?.toLowerCase().includes(q) ||
          c.username?.toLowerCase().includes(q)
      );
    }

    // Filter mode
    if (filterMode === "strong") {
      result = result.filter((c) => {
        const score = Number(
          c.pswdStrength?.find((t) => t.startsWith("score:"))?.split(":")[1] ?? 0
        );
        return score >= 3;
      });
    } else if (filterMode === "weak") {
      result = result.filter((c) => {
        const score = Number(
          c.pswdStrength?.find((t) => t.startsWith("score:"))?.split(":")[1] ?? 0
        );
        return score <= 1;
      });
    }

    // Sorting
    if (sortBy === "az") {
      result.sort((a, b) => a.serviceName.localeCompare(b.serviceName));
    } else if (sortBy === "strength") {
      result.sort((a, b) => {
        const scoreA = Number(
          a.pswdStrength?.find((t) => t.startsWith("score:"))?.split(":")[1] ?? 0
        );
        const scoreB = Number(
          b.pswdStrength?.find((t) => t.startsWith("score:"))?.split(":")[1] ?? 0
        );
        return scoreB - scoreA;
      });
    }

    return result;
  }, [credentials, search, filterMode, sortBy]);

  const buckets = () => {
    const count = [0, 0, 0, 0, 0];
    credentials.forEach((c) => {
      const score = Number(
        c.pswdStrength?.find((t) => t.startsWith("score:"))?.split(":")[1] ?? 0
      );
      count[Math.min(score, 4)]++;
    });
    const total = credentials.length || 1;
    return count.map((n) => (n * 100) / total);
  };

  const current = credentials.find((c) => c.id === hoveredId);
  const crackTime =
    current?.pswdStrength?.find((t) => t.startsWith("crackTime:"))?.split(":")[1] ?? "";
  const tipsArr =
    current?.pswdStrength?.filter(
      (t) => !t.startsWith("score:") && !t.startsWith("crackTime:")
    ) || [];

  return (
    <div
      className={`min-h-screen ${choose(
        "bg-slate-50 text-slate-900",
        "bg-slate-950 text-slate-100"
      )} font-sans`}
    >
      <Sidebar active="credentials" />

      <main className="ml-64 p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Header & Greeting Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Password Vault
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                AES-256 Encrypted
              </span>
            </div>
            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
              Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.username || "Vault Master"}</span>. Manage and protect your digital identity.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Backend URL indicator button */}
            <button
              onClick={() => setShowConfigModal(true)}
              title="Click to check or change backend API connection"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                API Settings
              </span>
            </button>

            <Button
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-2 shrink-0"
              onClick={() => {
                setEdit(null);
                setModal(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Password</span>
            </Button>
          </div>
        </div>

        {/* 4 Professional KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Total Items */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${choose(
              "bg-white border-slate-200/80",
              "bg-slate-900/80 border-slate-800"
            )}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Items
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {stats.total}
              </span>
              <span className="text-xs text-slate-500">passwords saved</span>
            </div>
          </div>

          {/* Metric 2: Security Score */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${choose(
              "bg-white border-slate-200/80",
              "bg-slate-900/80 border-slate-800"
            )}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Vault Health
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.healthScore}%
              </span>
              <span className="text-xs text-slate-500">
                {stats.healthScore >= 80 ? "Optimal" : "Needs Review"}
              </span>
            </div>
          </div>

          {/* Metric 3: Strong Passwords */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${choose(
              "bg-white border-slate-200/80",
              "bg-slate-900/80 border-slate-800"
            )}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Strong Keys
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {stats.strongCount}
              </span>
              <span className="text-xs text-slate-500">high entropy</span>
            </div>
          </div>

          {/* Metric 4: At-Risk */}
          <div
            onClick={() => setFilterMode(filterMode === "weak" ? "all" : "weak")}
            className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${
              filterMode === "weak"
                ? "ring-2 ring-rose-500 border-rose-500"
                : choose("bg-white border-slate-200/80", "bg-slate-900/80 border-slate-800")
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                At-Risk Items
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                {stats.weakCount}
              </span>
              <span className="text-xs text-rose-500 font-medium">
                {filterMode === "weak" ? "Viewing filtered" : "Click to review"}
              </span>
            </div>
          </div>
        </div>

        {/* Analytics Distribution & Real-time Tips Box */}
        {credentials.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Password Health Ring */}
            <div
              className={`p-6 rounded-2xl border flex flex-col items-center justify-center shadow-sm ${choose(
                "bg-white border-slate-200/80",
                "bg-slate-900/80 border-slate-800"
              )}`}
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Strength Distribution
              </h3>
              <StrengthRing percentages={buckets()} />
            </div>

            {/* Live Security Inspector / Tips */}
            <div
              className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col shadow-sm ${choose(
                "bg-white border-slate-200/80",
                "bg-slate-900/80 border-slate-800"
              )}`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Security Inspector
                </h3>
                {current && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Inspecting: {current.serviceName}
                  </span>
                )}
              </div>

              <div className="mt-4 flex-1">
                {hoveredId ? (
                  <div className="space-y-3">
                    {crackTime && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                        <Shield className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium">Estimated Crack Time:</span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {crackTime}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Recommendations:
                      </p>
                      {tipsArr.length > 0 ? (
                        <ul className="space-y-1.5 text-sm">
                          {tipsArr.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                              <span className="text-indigo-500 font-bold">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Strong password with excellent entropy!
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center p-4 text-slate-400">
                    <Shield className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-sm">
                      Hover over any credential card below to inspect its security diagnostics and cracking resistance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toolbar: Search, Filter Chips & Sorting */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by service or username…"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm ${choose(
                "bg-white border-slate-300 placeholder:text-slate-400 text-slate-900",
                "bg-slate-900 border-slate-800 placeholder:text-slate-500 text-slate-100"
              )}`}
            />
          </div>

          {/* Filter Chips & Sort Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterMode === "all"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                All ({credentials.length})
              </button>
              <button
                onClick={() => setFilterMode("strong")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterMode === "strong"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Strong ({stats.strongCount})
              </button>
              <button
                onClick={() => setFilterMode("weak")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterMode === "weak"
                    ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                At Risk ({stats.weakCount})
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm ${choose(
                "bg-white border-slate-300 text-slate-700",
                "bg-slate-900 border-slate-800 text-slate-300"
              )}`}
            >
              <option value="newest">Sort: Recently Added</option>
              <option value="az">Sort: Alphabetical (A-Z)</option>
              <option value="strength">Sort: By Strength</option>
            </select>
          </div>
        </div>

        {/* Credentials Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-slate-200/60 dark:bg-slate-800/40 animate-pulse border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        ) : filteredCredentials.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {search ? "No matching credentials" : "Your vault is empty"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              {search
                ? "Try searching for a different service name or clear the search filter."
                : "Store your website accounts and passwords securely with military-grade encryption."}
            </p>
            {search ? (
              <Button
                onClick={() => setSearch("")}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-medium hover:bg-slate-300 transition"
              >
                Clear Search Filter
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setEdit(null);
                  setModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4 mr-2 inline" /> Add Your First Password
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCredentials.map((cred) => (
              <CredentialCard
                key={cred.id}
                credential={cred}
                onEdit={(c) => {
                  setEdit(c);
                  setModal(true);
                }}
                onDelete={() => confirmDel(cred.id)}
                highlight={search !== ""}
                setHoveredId={setHoveredId}
                edited={cred.id === recentlyEditedId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Credential Modal */}
      <CredentialModal
        isOpen={modal}
        onClose={() => setModal(false)}
        credential={edit}
        onSave={save}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <>
          <div
            onClick={cancelDel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className={`rounded-2xl shadow-2xl p-6 w-full max-w-md text-center space-y-4 border ${choose(
                "bg-white border-slate-200",
                "bg-slate-900 border-slate-800"
              )}`}
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Delete Credential?
              </h3>
              <p className="text-sm text-slate-500">
                This item will be permanently removed from your vault. This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={cancelDel}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition"
                >
                  Cancel
                </Button>
                <Button
                  onClick={proceedDel}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition shadow-sm shadow-rose-600/30"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Backend API Configuration Modal */}
      {showConfigModal && (
        <>
          <div
            onClick={() => setShowConfigModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className={`rounded-2xl shadow-2xl p-6 w-full max-w-lg border space-y-5 ${choose(
                "bg-white border-slate-200",
                "bg-slate-900 border-slate-800"
              )}`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Backend Connection Settings
                  </h3>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Active Backend Target
                  </label>
                  <p className="font-mono text-xs p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 break-all">
                    {activeBackendUrl}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Override Backend URL (for Render / Cloud)
                  </label>
                  <input
                    type="url"
                    value={customBackendUrl}
                    onChange={(e) => setCustomBackendUrl(e.target.value)}
                    placeholder="https://password-manager-backend.onrender.com"
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    On Vercel, paste your live Render backend URL here if you haven't set VITE_BACKEND_URL in Vercel project environment variables.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-medium hover:bg-slate-300 transition"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBackendUrl}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-sm"
                >
                  Save & Connect
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
