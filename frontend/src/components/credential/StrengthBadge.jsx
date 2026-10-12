// src/components/credential/StrengthBadge.jsx
import { useTheme } from "../../context/ThemeContext";

const colors = ["bg-red-600", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-blue-600"];
const label  = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

export default function StrengthBadge({ strengthArr, showDetails = false }) {
  const { theme, choose } = useTheme();
  if (!Array.isArray(strengthArr) || strengthArr.length === 0) return null;

  const score = Number(strengthArr.find(s => s.startsWith("score:"))?.split(":")[1] ?? 0);
  const crack = strengthArr.find(s => s.startsWith("crackTime:"))?.split(":")[1] ?? "";
  const tips  = strengthArr.filter(s => !s.startsWith("score:") && !s.startsWith("crackTime:"));

  if (!showDetails) {
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[score]} text-white`}>
        {label[score]}
      </span>
    );
  }

  return (
    <div className={`flex flex-col gap-2 text-xs ${choose("text-gray-800","text-gray-100")}`}>
      <span className={`self-start px-2 py-0.5 rounded text-xs font-medium ${colors[score]} text-white`}>
        {label[score]}
      </span>
      <p><span className="font-semibold">Crack time:</span>&nbsp;{crack}</p>
      {tips.length > 0 && (
        <ul className="list-disc ml-4 space-y-0.5">
          {tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
    </div>
  );
}
