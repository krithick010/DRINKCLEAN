export function LoadingSpinner({ size = "md", message = "Loading..." }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-cyan-400 border-t-transparent`}
      />
      {message && <p className="text-sm text-slate-400">{message}</p>}
    </div>
  );
}
