// src/pages/Dashboard.jsx
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "../context/ThemeContext";
import Sidebar from "../components/layout/Sidebar";
import CredentialCard from "../components/credential/CredentialCard";
import CredentialModal from "../components/credential/CredentialModal";
import StrengthRing from "../components/credential/StrengthRing";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";

import * as credSvc from "../services/credentialService";

export default function Dashboard() {
  const { choose } = useTheme();

  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [recentlyEditedId, setRecentlyEditedId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await credSvc.fetchAll();
        setCredentials(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (obj) => {
    let saved;
    if (edit) {
      const data = await credSvc.updateOne(edit.id, obj);
      setCredentials((prev) => prev.map((c) => (c.id === edit.id ? data : c)));
      saved = data;
    } else {
      const data = await credSvc.addOne(obj);
      setCredentials((prev) => [...prev, data]);
      saved = data;
    }
    setRecentlyEditedId(saved.id);
    setTimeout(() => setRecentlyEditedId(null), 2000);
    setModal(false);
    setEdit(null);
  };

  const confirmDel = (id) => setDeleteId(id);
  const cancelDel = () => setDeleteId(null);
  const proceedDel = async () => {
    try {
      await credSvc.deleteOne(deleteId);
    } finally {
      setCredentials((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    }
  };

  const filtered =
    Array.isArray(credentials) && credentials.length
      ? credentials.filter(
          (c) =>
            c.serviceName.toLowerCase().includes(search.toLowerCase()) ||
            c.username.toLowerCase().includes(search.toLowerCase())
        )
      : [];

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
    <div className={`min-h-screen ${choose("bg-gray-50", "bg-gray-900")}`}>
      <Sidebar active="credentials" />

      <main className="ml-64 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${choose("text-gray-900", "text-gray-100")}`}>
              My Passwords
            </h1>
            <p className={choose("text-gray-600", "text-gray-400")}>
              Manage your saved credentials
            </p>
          </div>

          <Button
            className="w-full max-w-[180px] py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition flex items-center justify-center space-x-2"
            onClick={() => {
              setEdit(null);
              setModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </Button>
        </div>

        <div className={`border-b my-6 ${choose("border-gray-200", "border-gray-700")}`} />

        <div className="max-w-sm mb-6">
          <InputField
            id="search"
            label=""
            icon={null}
            value={search}
            onChange={setSearch}
            placeholder="Search…"
          />
        </div>

        {search === "" && credentials.length > 0 && (
          <div className="flex flex-col lg:flex-row items-start justify-center gap-8 mb-10">
            <div
              className={`flex-1 flex flex-col items-center justify-center text-center px-8 py-6 rounded-xl border-2 ${choose(
                "bg-white border-gray-300",
                "bg-gray-800 border-gray-700"
              )} min-h-[260px]`}
            >
              <p className={choose("text-3xl text-gray-500", "text-3xl text-gray-400")}>
                Total Credentials
              </p>
              <p className={choose("text-5xl font-bold text-gray-900", "text-5xl font-bold text-gray-100")}>
                {credentials.length}
              </p>
            </div>

            <div
              className={`flex-1 flex items-center justify-center rounded-xl border-2 ${choose(
                "bg-white border-gray-300",
                "bg-gray-800 border-gray-700"
              )} min-h-[260px]`}
            >
              <StrengthRing percentages={buckets()} />
            </div>

            <div
              className={`flex-1 rounded-xl border-2 p-6 ${choose(
                "bg-white border-gray-300 text-gray-900",
                "bg-gray-800 border-gray-700 text-gray-100"
              )} min-h-[260px] flex flex-col overflow-hidden`}
            >
              {hoveredId ? (
                <>
                  <h2 className="text-lg font-semibold mb-2 shrink-0">Password Tips</h2>
                  {crackTime && (
                    <p className="mb-2 text-sm shrink-0">
                      <span className="font-semibold">Crack time: </span>
                      {crackTime}
                    </p>
                  )}
                  <div className="flex-1 overflow-y-auto pr-1">
                    {tipsArr.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {tipsArr.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm italic">No extra suggestions.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm italic text-center">
                    Hover a credential card to see tips here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`border-b my-6 ${choose("border-gray-200", "border-gray-700")}`} />

        {loading ? (
          <p className={choose("text-gray-700", "text-gray-300")}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className={choose("text-gray-600", "text-gray-400")}>No credentials found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((cred) => (
              <CredentialCard
                key={cred.id}
                credential={cred}
                onEdit={(cred) => {
                  setEdit(cred);
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

      <CredentialModal
        isOpen={modal}
        onClose={() => setModal(false)}
        credential={edit}
        onSave={save}
      />

      {deleteId && (
        <>
          <div onClick={cancelDel} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className={`rounded-xl shadow-lg px-8 py-6 w-[90%] max-w-md text-center space-y-6 ${choose(
                "bg-white",
                "bg-gray-800"
              )}`}
            >
              <p className={choose("text-lg font-semibold text-gray-800", "text-lg font-semibold text-gray-100")}>
                Are you sure you want to delete this credential?
              </p>
              <div className="flex justify-center gap-6">
                <Button
                  onClick={cancelDel}
                  className={choose(
                    "w-full py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-50 transition",
                    "w-full py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-100 disabled:opacity-50 transition"
                  )}
                >
                  Cancel
                </Button>
                <Button
                  onClick={proceedDel}
                  className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
