const strokeByStatus = {
  normal: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
  offline: "#64748b",
};

export function Sparkline({ data = [], status = "offline" }) {
  const values = data
    .map((value) => Number(value))
    .filter(Number.isFinite)
    .slice(-10);

  if (values.length < 2) {
    return <div className="h-10" />;
  }

  const width = 220;
  const height = 40;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="mt-3 border-t border-[var(--border-color)] pt-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-10 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Sensor trend sparkline"
      >
        <polyline
          fill="none"
          stroke={strokeByStatus[status] || strokeByStatus.offline}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}
