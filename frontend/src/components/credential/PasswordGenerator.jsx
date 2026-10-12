// src/components/credential/PasswordGenerator.jsx
import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function PasswordGenerator() {
  const { theme }   = useTheme();
  const choose      = (l, d) => (theme === "dark" ? d : l);

  const [length, setLength]     = useState(16);
  const [opts,   setOpts]       = useState({
    uppercase: true, lowercase: true, numbers: true, symbols: false,
  });
  const [pwd, setPwd]           = useState("");
  const [copied, setCopied]     = useState(false);
  const [generated, setGenerated] = useState(false);
  const [hovered, setHovered]   = useState(false);

  const grad = "bg-gradient-to-r from-red-500 to-blue-600 hover:from-red-600 hover:to-blue-700";

  function generate() {
    let chars = "";
    if (opts.uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (opts.lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (opts.numbers)   chars += "0123456789";
    if (opts.symbols)   chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let out = "";
    for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random()*chars.length)];
    setPwd(out);
    flash("generated");
  }

  const flash = (kind) => {
    kind === "copied" ? setCopied(true) : setGenerated(true);
    setTimeout(() => (kind === "copied" ? setCopied(false) : setGenerated(false)), 1500);
  };

  const copy = async () => {
    if (!pwd) return;
    try { await navigator.clipboard.writeText(pwd); flash("copied"); } catch {}
  };

  const toggle = (k) => setOpts({ ...opts, [k]: !opts[k] });

  /* --------------------------------------------------------- */
  return (
    <>
      {/* dim background only while hovering / focusing the panel */}
      {hovered && <div className="fixed inset-0 pl-64 bg-black/40 backdrop-blur-sm z-40" />}

      <div className="fixed inset-0 pl-64 z-50 flex items-center justify-center pointer-events-none">
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setHovered(true)}
          onBlurCapture={() => setHovered(false)}
          className={`
            relative pointer-events-auto w-[95%] max-w-2xl p-8 rounded-2xl shadow-lg
            border-2 border-red-500 transition duration-300 ease-out
            ${hovered ? "scale-110" : "scale-100"}
            ${choose("bg-white text-gray-900", "bg-gray-800 text-gray-100")}
          `}
        >
          <h3 className="text-2xl font-semibold mb-6 text-center">Password Generator</h3>

          {/* password field + copy */}
          <div className="flex items-center space-x-3">
            <input
              readOnly
              value={pwd}
              placeholder="Click Generate…"
              className={`
                flex-1 px-4 py-3 rounded-lg font-mono text-base
                ${choose("border border-gray-300 bg-gray-50", "border border-gray-600 bg-gray-700")}
              `}
            />
            <button
              onClick={copy}
              disabled={!pwd}
              className={`p-3 rounded-lg text-white font-bold disabled:opacity-50 ${grad}`}
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>

          {/* slider */}
          <label className="block text-sm mt-6 mb-1">Length: {length}</label>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(+e.target.value)}
            className="w-full mb-6 accent-red-500"
          />

          {/* options */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-base">
            {[
              ["uppercase","Uppercase"],
              ["lowercase","Lowercase"],
              ["numbers","Numbers"],
              ["symbols","Symbols"],
            ].map(([k,l]) => (
              <label key={k} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={opts[k]}
                  onChange={() => toggle(k)}
                  className="rounded accent-red-500"
                />
                <span>{l}</span>
              </label>
            ))}
          </div>

          <button
            onClick={generate}
            className={`w-full py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2 ${grad}`}
          >
            <RefreshCw className="w-5 h-5" />
            <span>Generate</span>
          </button>

          {/* feedback chip *outside* the panel, anchored bottom‑center */}
          {(copied || generated) && (
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 pointer-events-none">
              <span
                className={`
                  inline-block px-3 py-0.5 text-xs font-semibold text-white rounded-full
                  bg-gradient-to-r from-red-500 to-blue-600
                `}
              >
                {copied ? "Copied!" : "Generated!"}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
