"use client";

import { cn } from "@/lib/utils/cn";

const balloons = [
  { left: "6%", top: "18%", color: "from-pink-400/70 to-rose-300/50", delay: "0s", duration: "7.5s" },
  { left: "88%", top: "16%", color: "from-amber-300/70 to-orange-300/45", delay: "1.2s", duration: "8.4s" },
  { left: "78%", top: "72%", color: "from-cyan-300/70 to-sky-300/45", delay: "0.6s", duration: "9.1s" },
];

const sparkles = [
  { left: "12%", top: "34%", delay: "0s", duration: "3.6s" },
  { left: "72%", top: "28%", delay: "1.1s", duration: "4.4s" },
  { left: "58%", top: "76%", delay: "0.8s", duration: "3.8s" },
  { left: "30%", top: "82%", delay: "1.6s", duration: "4.1s" },
  { left: "90%", top: "48%", delay: "0.3s", duration: "3.9s" },
];

export function BirthdayEffects({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
      {balloons.map((balloon, index) => (
        <div
          key={`balloon-${index}`}
          className="absolute"
          style={{
            left: balloon.left,
            top: balloon.top,
            animationDelay: balloon.delay,
            animationDuration: balloon.duration,
          }}
        >
          <div className="birthday-float relative h-28 w-20">
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-20 rounded-[999px] bg-gradient-to-b shadow-[0_18px_40px_rgba(15,23,42,0.24)]",
                balloon.color
              )}
            />
            <div className="absolute left-1/2 top-[4.8rem] h-12 w-px -translate-x-1/2 bg-white/18" />
          </div>
        </div>
      ))}

      {sparkles.map((sparkle, index) => (
        <span
          key={`sparkle-${index}`}
          className="birthday-sparkle absolute block h-3 w-3 rounded-full bg-white/80"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            animationDelay: sparkle.delay,
            animationDuration: sparkle.duration,
          }}
        />
      ))}
    </div>
  );
}
