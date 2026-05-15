const statusMap = {
  online: { label: "● Online", className: "bg-emerald-500 text-white" },
  offline: { label: "● Offline", className: "bg-slate-600 text-white" },
  warning: { label: "⚠ Warning", className: "bg-amber-500 text-white" },
  critical: { label: "✕ Critical", className: "bg-red-600 text-white" },
  safe: { label: "✓ Safe", className: "bg-emerald-500 text-white" },
};

export function StatusBadge({ status = "offline" }) {
  const config = statusMap[status] || statusMap.offline;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}