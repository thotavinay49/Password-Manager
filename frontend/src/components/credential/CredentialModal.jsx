// src/components/credential/CredentialModal.jsx
import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function CredentialModal({ isOpen, onClose, credential, onSave }) {
  const { choose } = useTheme();
  const [form, setForm] = useState({ serviceName: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      credential
        ? {
            serviceName: credential.serviceName,
            username: credential.username,
            password: credential.password,
          }
        : { serviceName: "", username: "", password: "" }
    );
  }, [isOpen, credential]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  const inputCls = `
    w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500
    ${choose(
      "border border-gray-300 text-gray-900",
      "border border-gray-600 bg-gray-700 text-gray-100"
    )}
  `;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      panelClass={choose("bg-white", "bg-gray-800")}
    >
      <h2 className={`text-xl font-semibold ${choose("text-gray-900", "text-gray-100")}`}>
        {credential ? "Edit Credential" : "Add Credential"}
      </h2>

      <form onSubmit={submit} className="space-y-4 mt-6">
        {[
          ["serviceName", "Service Name"],
          ["username", "Username / Email"],
          ["password", "Password"],
        ].map(([k, label]) => (
          <div key={k}>
            <label
              className={`block mb-1 text-sm ${choose("text-gray-700", "text-gray-300")}`}
            >
              {label}
            </label>
            <input
              required
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className={inputCls}
            />
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            className={choose(
              "w-full py-3 rounded-lg font-semibold transition disabled:opacity-50 border border-gray-300 hover:bg-gray-50 text-gray-900",
              "w-full py-3 rounded-lg font-semibold transition disabled:opacity-50 border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-100"
            )}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={loading}
            className="w-full py-3 rounded-lg font-semibold transition disabled:opacity-50 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
