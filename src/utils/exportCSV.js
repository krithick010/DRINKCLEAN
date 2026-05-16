export const CSV_HEADERS = ["timestamp", "t_ev", "t_co", "t_sc", "p_su", "p_di", "tds", "ph", "sol", "pwr"];

export function exportCSV(history, filename = "desalination_data") {
  const rows = history.map((item) => {
    const timestamp = item.ts ? new Date(item.ts * 1000).toISOString() : "";
    return [
      timestamp,
      item.t_ev,
      item.t_co,
      item.t_sc,
      item.p_su,
      item.p_di,
      item.tds,
      item.ph,
      item.sol,
      item.pwr,
    ]
      .map((value) => value ?? "")
      .join(",");
  });

  const csv = [CSV_HEADERS.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filename}_${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}