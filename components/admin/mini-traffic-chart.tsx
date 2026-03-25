"use client";

import { useId } from "react";
import type { ProgramTrafficPoint } from "@/features/analytics/types";

interface MiniTrafficChartProps {
  points: ProgramTrafficPoint[];
  compact?: boolean;
}

export function MiniTrafficChart({
  points,
  compact = false,
}: MiniTrafficChartProps) {
  const chartId = useId().replace(/:/g, "");
  const safePoints = points.length > 0 ? points : [{ label: "--", count: 0 }];
  const width = compact ? 220 : 420;
  const height = compact ? 72 : 136;
  const paddingX = compact ? 8 : 12;
  const paddingY = compact ? 10 : 14;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const maxValue = Math.max(...safePoints.map((point) => point.count), 1);
  const stepX = safePoints.length > 1 ? chartWidth / (safePoints.length - 1) : chartWidth;

  const coordinates = safePoints.map((point, index) => {
    const x = paddingX + index * stepX;
    const y = paddingY + chartHeight - (point.count / maxValue) * chartHeight;
    return { x, y, point };
  });

  const linePath = coordinates
    .map((coord, index) => `${index === 0 ? "M" : "L"} ${coord.x} ${coord.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${paddingX + chartWidth} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`w-full overflow-visible ${compact ? "h-[72px]" : "h-[136px]"}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`traffic-area-${chartId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(56,189,248,0.42)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.02)" />
          </linearGradient>
          <linearGradient id={`traffic-line-${chartId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2d8cf0" />
          </linearGradient>
        </defs>

        {coordinates.map((coord) => (
          <line
            key={`${coord.point.label}-grid`}
            x1={coord.x}
            x2={coord.x}
            y1={paddingY}
            y2={height - paddingY}
            stroke="rgba(148,163,184,0.12)"
            strokeDasharray="3 6"
          />
        ))}

        <path d={areaPath} fill={`url(#traffic-area-${chartId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={`url(#traffic-line-${chartId})`}
          strokeWidth={compact ? 2.5 : 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coordinates.map((coord) => (
          <circle
            key={coord.point.label}
            cx={coord.x}
            cy={coord.y}
            r={compact ? 2.8 : 3.4}
            fill="#f8fafc"
            stroke="#38bdf8"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {!compact && (
        <div className="grid grid-cols-4 gap-2 text-[11px] text-white/42 sm:grid-cols-6">
          {safePoints.filter((_, index) => index % 2 === 0).map((point) => (
            <div key={point.label}>{point.label}</div>
          ))}
        </div>
      )}
    </div>
  );
}
