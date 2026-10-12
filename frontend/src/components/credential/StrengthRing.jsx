// src/components/credential/StrengthRing.jsx
import { useTheme } from "../../context/ThemeContext";

/* red → blue gradient progression */
const palette = [
  "#ef4444", // red‑500   → very weak
  "#f97316", // orange‑500
  "#eab308", // yellow‑400
  "#22c55e", // green‑500
  "#2563eb", // blue‑600  → very strong
];

const label = ["V‑Weak", "Weak", "Fair", "Strong", "V‑Strong"];

export default function StrengthRing({ percentages = [0, 0, 0, 0, 0] }) {
  const { choose } = useTheme();

  /* ring geometry */
  const size   = 160;
  const stroke = 20;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;

  let offset = 0;                           // running stroke offset

  return (
    <div className="flex items-center gap-6">
      {/* circular stacked ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0 rotate-ring"
      >
        {percentages.map((pct, i) => {
          const len        = (circ * pct) / 100; // arc length for this slice
          const dashOffset = -offset;
          offset += len;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={palette[i]}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${circ}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>

      {/* legend */}
      <div className="flex flex-col space-y-2 text-sm">
        {label.map((lbl, i) => (
          <div key={lbl} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: palette[i] }}
            />
            <span className={choose("text-gray-700", "text-gray-300")}>
              {lbl} {Number(percentages[i] ?? 0).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
