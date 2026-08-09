export default function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}