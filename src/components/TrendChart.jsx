import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import { generatePredictions } from "../utils/predict";

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #00d4ff",
  borderRadius: "12px",
  color: "#e2e8f0",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
};

export function TrendChart({
  data = [],
  dataKey,
  color = "#00d4ff",
  label = "Trend",
  xKey = "ts",
  type = "line",
  height = 320,
  series,
  predict = false,
}) {
  const Chart = type === "area" ? AreaChart : LineChart;
  
  // Apply prediction if enabled
  let chartData = data;
  if (predict) {
    const keysToPredict = series?.length > 0 ? series.map(s => s.dataKey) : [dataKey].filter(Boolean);
    keysToPredict.forEach(key => {
      chartData = generatePredictions(chartData, key, 5);
    });
  }

  const lineSeries =
    series?.length > 0
      ? series.map(s => ({
          ...s,
          dataKey: predict ? `${s.dataKey}_actual` : s.dataKey
        }))
      : [{ dataKey: predict ? `${dataKey}_actual` : dataKey, color, label }];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Trend {predict && "(Includes Forecast)"}</p>
          <h3 className="text-base font-semibold text-slate-100">{label}</h3>
        </div>
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={chartData}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              stroke="#94a3b8"
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
              minTickGap={20}
            />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={{ stroke: "#1e293b" }} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#94a3b8" }} />
            {type === "area" ? (
              <Area
                type="monotone"
                dataKey={lineSeries[0].dataKey}
                stroke={lineSeries[0].color}
                fill={lineSeries[0].color}
                fillOpacity={0.18}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ) : (
              lineSeries.map((item) => (
                <Line
                  key={item.dataKey}
                  type="monotone"
                  dataKey={item.dataKey}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              ))
            )}
            {/* Render dashed predicted line if predict is true */
              predict && type !== "area" && lineSeries.map((item) => {
                const originalKey = item.dataKey.replace('_actual', '');
                return (
                  <Line
                    key={`${originalKey}_predicted`}
                    type="monotone"
                    dataKey={`${originalKey}_predicted`}
                    name={`${item.label} (Pred)`}
                    stroke={item.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                );
              })
            }
            {predict && type === "area" && lineSeries.map((item) => {
              const originalKey = item.dataKey.replace('_actual', '');
              return (
                <Area
                  key={`${originalKey}_predicted`}
                  type="monotone"
                  dataKey={`${originalKey}_predicted`}
                  name={`${item.label} (Pred)`}
                  stroke={item.color}
                  fill="transparent"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              );
            })}
          </Chart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}