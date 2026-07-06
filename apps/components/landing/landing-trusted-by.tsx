"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Gauge, Timer, Rocket, Settings2 } from "lucide-react";

export const companies = [
  { name: "Clerk", logo: "/logos/clerk.svg", invert: false },
  { name: "Neon", logo: "/logos/neon.svg", invert: false },
  { name: "Expo", logo: "/logos/expo.svg", invert: true },
  { name: "Inngest", logo: "/logos/inngest.svg", invert: false },
  { name: "LiveKit", logo: "/logos/livekit.svg", invert: true },
  { name: "Convex", logo: "/logos/convex.svg", scale: 1.8, invert: false },
  { name: "ScaleKit", logo: "/logos/scalekit.svg", scale: 1.3, invert: false },
];

export function LogoAvatar({
  src,
  alt,
  size = 60,
  invert = false,
  scale = 1,
}: {
  src: string;
  alt: string;
  size?: number;
  invert?: boolean;
  scale?: number;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {!failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-contain ${invert ? "filter dark:invert" : ""}`}
          style={{ transform: `scale(${scale})` }}
          onError={() => setFailed(true)}
          priority={false}
        />
      ) : (
        <span className="text-[10px] font-semibold">{alt.charAt(0)}</span>
      )}
    </div>
  );
}

export function LandingTrustedBy() {
  return (
    <>
      <section className="border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border  px-4 py-4 flex items-start gap-3">
              <div className="mt-0.5">
                <Gauge className="h-4 w-4 text-sky-400" />
              </div>
              <div>
                <div className="text-xs font-medium tracking-tight">
                  2M+ logs/min ingest capacity
                </div>
                <div className="mt-1 text-[0.7rem] text-muted-foreground">
                  Built to keep up with busy apps.
                </div>
              </div>
            </div>
            <div className="rounded-xl border  px-4 py-4 flex items-start gap-3">
              <div className="mt-0.5">
                <Timer className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-medium tracking-tight ">
                  &lt;50ms average search time
                </div>
                <div className="mt-1 text-[0.7rem] text-muted-foreground">
                  Find what you need instantly.
                </div>
              </div>
            </div>
            <div className="rounded-xl border  px-4 py-4 flex items-start gap-3">
              <div className="mt-0.5">
                <Rocket className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <div className="text-xs font-medium tracking-tight ">
                  Start logging in under 60 seconds
                </div>
                <div className="mt-1 text-[0.7rem] text-muted-foreground">
                  From install to first log, fast.
                </div>
              </div>
            </div>
            <div className="rounded-xl border  px-4 py-4 flex items-start gap-3">
              <div className="mt-0.5">
                <Settings2 className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-medium tracking-tight ">
                  Zero config needed
                </div>
                <div className="mt-1 text-[0.7rem] text-muted-foreground">
                  No YAML, no servers, no tuning.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
