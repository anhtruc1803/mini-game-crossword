export interface ProgramTrafficPoint {
  label: string;
  count: number;
}

export interface ProgramAnalyticsSummary {
  programId: string;
  totalViewers: number;
  totalPageViews: number;
  onlineViewers: number;
  lastSeenAt: string | null;
  trafficTrend: ProgramTrafficPoint[];
}
