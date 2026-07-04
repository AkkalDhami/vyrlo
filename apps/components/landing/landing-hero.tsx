"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, ArrowRight, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";

const LOG_SNIPPETS = [
  {
    time: "12:16:24",
    level: "INFO",
    msg: "User signed in with GitHub",
    color: "text-sky-400",
  },
  {
    time: "12:16:25",
    level: "DEBUG",
    msg: "Cache hit for profile_data",
    color: "text-emerald-400",
  },
  {
    time: "12:16:26",
    level: "INFO",
    msg: "Dashboard rendered (42ms)",
    color: "text-sky-400",
  },
  {
    time: "12:16:28",
    level: "WARN",
    msg: "Rate limit approaching for IP 192.168.x.x",
    color: "text-amber-400",
  },
  {
    time: "12:16:29",
    level: "INFO",
    msg: "Payment webhook received",
    color: "text-sky-400",
  },
  {
    time: "12:16:31",
    level: "ERROR",
    msg: "Failed to sync with external provider",
    color: "text-rose-400",
  },
];

export function LandingHero() {
  const [logs, setLogs] = useState(LOG_SNIPPETS.slice(0, 3));
  const METRIC_REFRESH_SECONDS = 4;
  const [requestsPerMin, setRequestsPerMin] = useState(842);
  const [avgLatencyMs, setAvgLatencyMs] = useState(29);

  useEffect(() => {
    const interval = setInterval(() => {
      setRequestsPerMin((prev) => {
        const delta = Math.floor(Math.random() * 21) - 10;
        const next = prev + delta;
        return Math.max(780, Math.min(980, next));
      });
      setAvgLatencyMs((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return Math.max(20, Math.min(50, next));
      });
    }, METRIC_REFRESH_SECONDS * 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live logs
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const nextIndex =
          (LOG_SNIPPETS.indexOf(prev[prev.length - 1]) + 1) %
          LOG_SNIPPETS.length;
        const newLog = LOG_SNIPPETS[nextIndex];
        // Keep only last 3 logs
        return [...prev.slice(1), newLog];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative border-b  overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center relative z-10">
        {/* Left copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Logs ready in <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-500">
              under a minute.
            </span>
          </h1>
          <p className="text-base sm:text-lg max-w-lg leading-relaxed mb-8">
            Vyrlo gives you structured logs, error tracking, request insights,
            and live log streaming with almost zero configuration, so you can
            spend more time building.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link href="/dashboard/overview">
              <Button>
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#pricing">
              <Button variant={"outline"}>View Pricing</Button>
            </a>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-emerald-500/10">
                <Check className="h-3 w-3 text-emerald-600" />
              </div>
              <span>Free for side projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-sky-500/10">
                <Check className="h-3 w-3 text-sky-600" />
              </div>
              <span>No credit card required</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative group"
        >
          <div className="relative rounded-2xl border overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium tracking-tight">
                  Live Production
                </span>
              </div>
            </div>

            {/* Simple Metrics */}
            <div className="grid grid-cols-3 divide-accent divide-x gap-px border-b">
              {[
                {
                  label: "Errors",
                  value: "0",
                  status: "All clear",
                  color: "text-emerald-400",
                },
                {
                  label: "Requests",
                  value: requestsPerMin.toLocaleString(),
                  unit: "/m",
                  status: "Streaming in",
                  color: "text-sky-400",
                },
                {
                  label: "Avg Latency",
                  value: avgLatencyMs,
                  unit: "ms",
                  status: avgLatencyMs < 35 ? "Feels fast" : "Watch latency",
                  color:
                    avgLatencyMs < 35 ? "text-emerald-400" : "text-amber-400",
                },
              ].map((metric, i) => (
                <div key={i} className="p-5 transition-colors">
                  <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    {metric.label}
                  </div>
                  <div className="text-xl font-bold tracking-tight text-50">
                    {metric.value}
                    {metric.unit && (
                      <span className="text-sm text-muted-foreground font-medium ml-0.5">
                        {metric.unit}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[0.65rem] ${metric.color} mt-1 font-medium`}
                  >
                    {metric.status}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 min-h-45 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Live Stream
                </span>
              </div>

              <div className="flex-1 space-y-3 font-mono text-[0.7rem] overflow-hidden relative">
                <AnimatePresence mode="popLayout">
                  {logs.map((log) => (
                    <motion.div
                      key={log.time + log.msg}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-3 items-baseline group/log"
                    >
                      <span className="text-muted-foreground shrink-0">
                        {log.time}
                      </span>
                      <span className={`font-bold shrink-0 w-10 ${log.color}`}>
                        {log.level}
                      </span>
                      <span className="truncate group-hover/log:text-slate-100 transition-colors">
                        {log.msg}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-3 border-t text-[0.65rem] text-muted-foreground flex items-center justify-between">
                <span>Paste one snippet, watch logs appear.</span>
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse delay-75"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
