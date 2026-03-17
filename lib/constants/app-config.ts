/** Application-wide configuration constants. */

export const APP_CONFIG = {
  name: "Mini Game O Chu",
  description: "Mini game o chu realtime cho livestream",
  /** Max rows per crossword game */
  maxRows: 20,
  /** Fallback polling interval in ms for the public viewer snapshot */
  pollingIntervalMs: 30000,
} as const;
