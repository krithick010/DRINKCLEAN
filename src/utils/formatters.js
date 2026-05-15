export function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return Number(value).toFixed(digits);
}

export function formatInteger(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return Math.round(Number(value)).toString();
}

export function formatTime(timestamp) {
  if (!timestamp) {
    return "--";
  }

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString();
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) {
    return "--";
  }

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}