export default function Button({
  children,
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={
        className
      }
    >
      {loading ? "Loading…" : children}
    </button>
  );
}
