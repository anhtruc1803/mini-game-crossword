"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ResilientImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackLabel?: string;
  loading?: "eager" | "lazy";
}

function buildInitials(label: string) {
  const words = label.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (words.length === 0) return "MG";
  return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
}

export function ResilientImage({
  src,
  alt,
  className,
  imgClassName,
  fallbackLabel,
  loading = "lazy",
}: ResilientImageProps) {
  const [failed, setFailed] = useState(!src);
  const initials = buildInitials(fallbackLabel ?? alt);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(94,234,212,0.2),transparent_45%),linear-gradient(160deg,rgba(15,23,42,0.96),rgba(12,18,34,0.82))]",
          className
        )}
      >
        <div className="flex flex-col items-center gap-3 text-center text-white/80">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/15 bg-white/8 text-xl font-semibold shadow-[0_0_30px_rgba(96,165,250,0.16)] backdrop-blur-xl">
            {initials}
          </div>
          <p className="text-sm font-medium text-white/90">{fallbackLabel ?? alt}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-[inherit]", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes="100vw"
        priority={loading === "eager"}
        onError={() => setFailed(true)}
        className={cn("object-cover", imgClassName)}
      />
    </div>
  );
}
