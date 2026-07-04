"use client";

import React from "react";
import { Zap, Search, Eye, FileJson } from "lucide-react";
import { motion, Variants } from "motion/react";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { SubHeading } from "@/components/ui/sub-heading";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function LandingFeatures() {
  const features = [
    {
      title: "Capture & Store Instantly",
      description:
        "Send JSON logs from your app, API, or background jobs without schemas or migrations. We index everything automatically so you can focus on shipping.",
      icon: (
        <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center mb-5">
          <Zap className="text-sky-400 h-5 w-5" strokeWidth={1.5} />
        </div>
      ),
    },
    {
      title: "Search & Debug Live",
      description:
        "Find bugs in seconds with simple filters like status:500. Watch events stream in real-time with Live Tail to see exactly what&apos;s happening.",
      icon: (
        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-5">
          <Search className="text-emerald-400 h-5 w-5" strokeWidth={1.5} />
        </div>
      ),
    },
    {
      title: "Live Log Stream",
      description:
        "Get a live stream of your log data directly in your application. Build your own custom dashboard views without needing to visit our website to check your logs.",
      icon: (
        <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center mb-5">
          <Eye className="text-pink-400 h-5 w-5" strokeWidth={1.5} />
        </div>
      ),
    },
    {
      title: "Smart Alerts & Webhooks",
      description:
        "Never miss a critical error. Set up alerts for specific events and receive instant notifications via webhooks. Track application crashes before they happen.",
      icon: (
        <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-5">
          <FileJson className="text-cyan-400 h-5 w-5" strokeWidth={1.5} />
        </div>
      ),
    },
  ];

  return (
    <>
      <Section id="story">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="text-xs font-medium tracking-wide text-brand-500 uppercase mb-4">
            Why OneMinute Logs exists
          </div>
          <Heading>Logging shouldn&apos;t feel like a whole other job.</Heading>
          <div className="space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p className="text-muted-foreground">
              Most devs don&apos;t have time to babysit a logging stack. ELK,
              random dashboards, YAML jungles — all just to answer one question:{" "}
              <span className="font-medium">What went wrong?</span>
            </p>
            <p>
              If you&apos;re shipping fast — junior, indie, side-project, or a
              small team — you don&apos;t want to spend days wiring logs. You
              just want errors, requests, and latency in one place, instantly.
            </p>
            <p>OneMinute Logs removes all the overhead.</p>
            <p>
              Drop in a small SDK, deploy, and your logs start streaming in
              under a minute. No servers. No cluster tuning. No 40-page docs
              before anything works.
            </p>
            <p>
              It’s logging that just works, instead of becoming another system
              you have to maintain.
            </p>
          </div>
        </motion.div>
      </Section>

      <Section id="features" className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:justify-between gap-4"
        >
          <Heading>Everything you need. Nothing you don&apos;t.</Heading>
          <SubHeading>
            Simple tools that help you see what your app is doing, without
            learning a new system.
          </SubHeading>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((c, i) => (
            <motion.article
              key={i}
              variants={itemVariants}
              className="rounded-lg border  overflow-hidden flex flex-col hover:bg-muted/30 transition-colors duration-300"
            >
              <div className="p-6 sm:p-8">
                {c.icon}
                <h3 className="text-lg font-semibold tracking-tight mb-2">
                  {c.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {c.description}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </Section>
    </>
  );
}
