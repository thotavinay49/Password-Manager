import { useTheme } from "../../context/ThemeContext";

/**
 * toast = { id:number, text:string, type:"info"|"success"|"error" }
 */
export default function Toast({ toast }) {
  const { choose } = useTheme();
  if (!toast) return null;

  const { id, text, type = "info" } = toast;

  const style = {
    info: choose(
      "bg-blue-50 text-blue-600 border border-blue-600",
      "bg-blue-900/30 text-blue-300 border border-blue-600/50"
    ),
    success: choose(
      "bg-green-50 text-green-700 border border-green-600",
      "bg-green-900/30 text-green-300 border border-green-600/50"
    ),
    error: choose(
      "bg-red-50 text-red-700 border border-red-600",
      "bg-red-900/30 text-red-300 border border-red-600/50"
    ),
  }[type];

  return (
    <div
      key={id}
      className="fixed inset-x-0 top-4 z-50 flex justify-center pointer-events-none"
    >
      <div
        className={`pointer-events-auto px-5 py-3 rounded-xl font-semibold text-sm ${style} animate-toast backdrop-blur-sm`}
      >
        {text}
      </div>

      <style jsx="true">{`
        @keyframes toast-in {
          0%   { opacity: 0; transform: translateY(-60px); }
          65%  { opacity: 1; transform: translateY(6px);   }
          100% { opacity: 1; transform: translateY(0);     }
        }
        @keyframes toast-out {
          0%   { opacity: 1; transform: translateY(0);     }
          100% { opacity: 0; transform: translateY(-60px); }
        }
        .animate-toast {
          animation:
            toast-in 0.7s cubic-bezier(.25,.8,.4,1),
            toast-out 0.7s cubic-bezier(.25,.8,.4,1) 3.3s forwards;
        }
      `}</style>
    </div>
  );
}
