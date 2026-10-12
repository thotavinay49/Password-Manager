// src/hooks/useCopyToClipboard.jsx
import { useEffect, useRef, useState } from "react";

export default function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return [copied, copy];
}
