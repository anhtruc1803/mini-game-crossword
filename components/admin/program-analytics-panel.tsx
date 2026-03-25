"use client";

import { MiniTrafficChart } from "@/components/admin/mini-traffic-chart";
import { useTranslation } from "@/lib/i18n";
import type { ProgramAnalyticsSummary } from "@/features/analytics/types";

function formatRelativeTime(value: string | null, locale: "vi" | "en") {
  if (!value) {
    return locale === "vi" ? "Chưa có dữ liệu" : "No data yet";
  }

  const diffMs = new Date(value).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const diffHours = Math.round(diffMs / 3_600_000);
  const diffDays = Math.round(diffMs / 86_400_000);

  const formatter = new Intl.RelativeTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    numeric: "auto",
  });

  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute");
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour");
  return formatter.format(diffDays, "day");
}

export function ProgramAnalyticsPanel({
  analytics,
}: {
  analytics: ProgramAnalyticsSummary;
}) {
  const { locale } = useTranslation();

  const labels =
    locale === "vi"
      ? {
          eyebrow: "Analytics nội bộ",
          title: "Người xem",
          subtitle:
            "Theo dõi người xem đang online và lượt truy cập của chương trình này.",
          online: "Đang online",
          viewers: "Tổng người xem",
          pageViews: "Lượt tải trang",
          lastSeen: "Hoạt động gần nhất",
          trend: "Xu hướng 2 giờ gần nhất",
          trendSubtitle: "Mỗi điểm tương ứng 10 phút pageview.",
          note:
            "Online được tính theo người xem có heartbeat trong 45 giây gần nhất.",
        }
      : {
          eyebrow: "First-party analytics",
          title: "Audience",
          subtitle: "Track live viewers and visit volume for this program.",
          online: "Online now",
          viewers: "Total viewers",
          pageViews: "Page views",
          lastSeen: "Last activity",
          trend: "Traffic trend in the last 2 hours",
          trendSubtitle: "Each point represents 10 minutes of pageviews.",
          note: "Online viewers are sessions seen within the last 45 seconds.",
        };

  const stats = [
    { label: labels.online, value: analytics.onlineViewers, tone: "text-emerald-300" },
    { label: labels.viewers, value: analytics.totalViewers, tone: "text-white" },
    { label: labels.pageViews, value: analytics.totalPageViews, tone: "text-sky-300" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-white/42">{labels.eyebrow}</p>
        <h3 className="mt-2 text-xl font-semibold text-white">{labels.title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/60">{labels.subtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-panel-soft rounded-[22px] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">{stat.label}</p>
            <p className={`mt-3 text-3xl font-bold ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel-soft rounded-[22px] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">{labels.lastSeen}</p>
            <p className="mt-2 text-base font-semibold text-white">
              {formatRelativeTime(analytics.lastSeenAt, locale)}
            </p>
          </div>
          <span className="rounded-full bg-emerald-400/12 px-3 py-1 text-xs text-emerald-300">
            {labels.note}
          </span>
        </div>
      </div>

      <div className="glass-panel-soft rounded-[22px] p-4">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.22em] text-white/42">{labels.trend}</p>
          <p className="mt-2 text-sm text-white/60">{labels.trendSubtitle}</p>
        </div>
        <MiniTrafficChart points={analytics.trafficTrend} />
      </div>
    </div>
  );
}
