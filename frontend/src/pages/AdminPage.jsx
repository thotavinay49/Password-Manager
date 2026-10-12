// src/pages/AdminPage.jsx
import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Circle,
  Trash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

import Sidebar from "../components/layout/Sidebar";
import InputField from "../components/ui/InputField";
import PasswordField from "../components/ui/PasswordField";
import Button from "../components/ui/Button";

import {
  getAllUsers,
  addUser as addUserSrv,
  deleteUserById,
  deleteCredentialFromUser,
} from "../services/adminService";

export default function AdminPage() {
  const { user, loading } = useAuth();  // <-- get loading here
  const { choose } = useTheme();
  const { show } = useToast();
  const navigate = useNavigate();

  /* password‑strength palette */
  const palette = [
    { bg: "#ef4444", txt: "#ffffff" },
    { bg: "#f97316", txt: "#ffffff" },
    { bg: "#eab308", txt: "#000000" },
    { bg: "#22c55e", txt: "#000000" },
    { bg: "#2563eb", txt: "#ffffff" },
  ];
  const clampScore = (s) =>
    Number.isFinite(s) && s >= 0 && s < palette.length ? s : 2;
  const getScore = (cred) => {
    const raw =
      cred.pswdStrength?.find((t) => t.startsWith("score:")) ||
      cred.strengthArr?.find((t) => t.startsWith("score:"));
    return clampScore(Number(raw?.split(":")[1]));
  };

  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchUsers = useCallback(() => {
    getAllUsers().then((res) => setUsers(res.data));
  }, []);

  const toggleUser = (id) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const addUser = async () => {
    if (!newUser.username || !newUser.password || saving) return;
    try {
      setSaving(true);
      const { data } = await addUserSrv(
        newUser.username,
        newUser.password
      );
      setUsers((u) => [...u, data]);
      setNewUser({ username: "", password: "" });
      show("User added", 3000, "success");
    } catch {
      show("Failed to add user", 4000, "error");
    } finally {
      setSaving(false);
    }
  };

  const proceedDel = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === "user") {
        await deleteUserById(confirm.userId);
        setUsers((u) => u.filter((usr) => usr.id !== confirm.userId));
        setExpanded((e) => {
          const copy = { ...e };
          delete copy[confirm.userId];
          return copy;
        });
        show("User deleted", 3000, "success");
      } else {
        await deleteCredentialFromUser(confirm.userId, confirm.credId);
        setUsers((u) =>
          u.map((usr) =>
            usr.id === confirm.userId
              ? {
                  ...usr,
                  credentials: usr.credentials.filter(
                    (c) => c.id !== confirm.credId
                  ),
                }
              : usr
          )
        );
        show("Credential deleted", 3000, "success");
      }
    } catch {
      show("Deletion failed", 4000, "error");
    } finally {
      setConfirm(null);
    }
  };

  useEffect(fetchUsers, [fetchUsers]);

  if (loading) {
    // Show loading indicator while auth is being checked/refreshed
    return (
      <div
        className={choose(
          "min-h-screen flex items-center justify-center bg-gray-50 text-gray-900",
          "min-h-screen flex items-center justify-center bg-gray-900 text-gray-100"
        )}
      >
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!user?.isAdmin) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  /* prettier, mid‑aligned Add button */
  const addBtnCls = choose(
    "w-auto px-4 py-2 flex items-center gap-1 rounded-md font-bold transition disabled:opacity-50 bg-gradient-to-r from-blue-500 to-purple-600 text-gray-900 hover:opacity-90",
    "w-auto px-4 py-2 flex items-center gap-1 rounded-md font-bold transition disabled:opacity-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90"
  );

  return (
    <div className={choose("bg-gray-50 min-h-screen", "bg-gray-900 min-h-screen")}>
      <Sidebar active="admin" />

      <div className="ml-64 p-8">
        <h1
          className={choose(
            "text-2xl font-bold text-gray-900 mb-6",
            "text-2xl font-bold text-gray-100 mb-6"
          )}
        >
          Admin · Users
        </h1>

        <div className={`border-b my-6 ${choose("border-gray-200", "border-gray-700")}`} />

        {/* add‑user controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <InputField
            id="new-username"
            label="Username"
            value={newUser.username}
            onChange={(v) => setNewUser({ ...newUser, username: v })}
            autoComplete="off"
            placeholder="username"
          />

          <PasswordField
            id="new-password"
            label="Password"
            value={newUser.password}
            onChange={(v) => setNewUser({ ...newUser, password: v })}
            autoComplete="new-password"
            placeholder="password"
          />

          <Button
            onClick={addUser}
            disabled={!newUser.username || !newUser.password || saving}
            loading={saving}
            className={`${addBtnCls} self-end mt-[2px]`}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {/* user cards */}
        <div className="space-y-4">
          {users.map((u) => (
            <div
              key={u.id}
              className={choose(
                "bg-white rounded-xl shadow-sm overflow-hidden",
                "bg-gray-800 rounded-xl shadow-sm overflow-hidden"
              )}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleUser(u.id)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && toggleUser(u.id)
                }
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Circle
                    size={8}
                    fill="currentColor"
                    className={choose("text-gray-400", "text-gray-600")}
                  />
                  <span
                    className={choose(
                      "font-semibold text-gray-900",
                      "font-semibold text-gray-100"
                    )}
                  >
                    {u.username}
                  </span>
                  <span
                    className={choose(
                      "text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700",
                      "text-xs px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-200"
                    )}
                  >
                    {u.role.replace("ROLE_", "")}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {u.role !== "ROLE_ADMIN" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirm({ type: "user", userId: u.id });
                      }}
                      className={choose(
                        "text-red-600 hover:bg-red-50 p-1 rounded",
                        "text-red-400 hover:bg-red-900/20 p-1 rounded"
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {expanded[u.id] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* credential list */}
              <div
                className={`cred-panel ${
                  expanded[u.id] ? "open" : ""
                } px-6 pb-4 space-y-3`}
              >
                {(u.credentials || []).length === 0 ? (
                  <p className={choose("text-gray-500", "text-gray-400")}>
                    No credentials
                  </p>
                ) : (
                  u.credentials.map((c) => {
                    const { bg, txt } = palette[getScore(c)];
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-4 rounded-lg px-4 py-2"
                        style={{ backgroundColor: bg, color: txt }}
                      >
                        <div className="flex-1 overflow-hidden">
                          <p className="font-semibold truncate">
                            {c.title || c.site || "Credential"}
                          </p>
                          <p className="text-sm truncate">{c.username}</p>
                        </div>

                        <p className="text-sm font-mono">
                          {c.password || "••••••"}
                        </p>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirm({
                              type: "cred",
                              userId: u.id,
                              credId: c.id,
                            });
                          }}
                          className="p-1 rounded hover:bg-white/20 hover:text-white transition"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* confirm dialog */}
      {confirm && (
        <>
          <div
            onClick={() => setConfirm(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className={choose(
                "bg-white rounded-xl shadow-lg px-8 py-6 w-[90%] max-w-md text-center space-y-6",
                "bg-gray-800 rounded-xl shadow-lg px-8 py-6 w-[90%] max-w-md text-center space-y-6"
              )}
            >
              <p
                className={choose(
                  "text-lg font-semibold text-gray-800",
                  "text-lg font-semibold text-gray-100"
                )}
              >
                {confirm.type === "user"
                  ? "Delete this user and all their credentials?"
                  : "Delete this credential?"}
              </p>

              <div className="flex justify-center gap-6">
                <Button
                  onClick={() => setConfirm(null)}
                  className={choose(
                    "w-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold",
                    "w-auto px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold"
                  )}
                >
                  Cancel
                </Button>

                <Button
                  onClick={proceedDel}
                  className="w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .cred-panel {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          pointer-events: none;
          transition: max-height .3s ease, opacity .3s ease;
        }
        .cred-panel.open {
          max-height: 1000px;
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}
