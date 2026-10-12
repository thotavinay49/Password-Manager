// ./src/components/ui/Modal.jsx
import { useState } from "react";

export default function Modal({
  isOpen,
  onClose,
  children,
  panelClass = "",
  overlayClass = "",
  animated = true,
  outsideClosable = true,
}) {
  const [show] = useState(isOpen);
  if (!isOpen) return null;

  const panelBase = `
    w-11/12 max-w-md p-6 rounded-xl shadow-lg
    ${animated ? "animate-modal-in" : ""}
    ${panelClass}
  `;
  const overlayBase = `
    fixed inset-0 bg-black/40 backdrop-blur-sm z-40
    ${animated ? "animate-fade-in" : ""}
    ${overlayClass}
  `;

  return (
    <>
      <div
        onClick={outsideClosable ? onClose : undefined}
        className={overlayBase}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className={panelBase}>{children}</div>
      </div>

      <style jsx="true">{`
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
        .animate-modal-in { animation: modal-in 0.25s ease-out; }
      `}</style>
    </>
  );
}
