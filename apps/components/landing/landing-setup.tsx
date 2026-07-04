"use client";

import React, { useState } from "react";
import {
  Package,
  MousePointerClick,
  Monitor,
  Sparkles,
  Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Heading } from "@/components/ui/heading";
import { SubHeading } from "@/components/ui/sub-heading";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "Install the package",
    description: "Add the SDK to your app with your favorite package manager.",
    icon: Package,
    code: `npm install @oneminutelogs/next
# or
npm install @oneminutelogs/express`,
    language: "bash",
  },
  {
    id: 2,
    title: "Initialize the logger",
    description: "Configure the logger with your API key.",
    icon: MousePointerClick,
    code: `import { createLogger } from "@oneminutelogs/next";

export const log = createLogger({
  apiKey: process.env.ONE_MINUTE_LOGS_API_KEY!,
  appName: process.env.ONE_MINUTE_LOGS_APP_NAME!,
  environment: process.env.ONE_MINUTE_LOGS_ENVIRONMENT || "development",
});`,
    language: "typescript",
  },
  {
    id: 3,
    title: "Send logs",
    description: "Log events from anywhere in your app.",
    icon: Monitor,
    code: `
// Log success
await log.send("User logged in", { 
  type:"success",
  email: session?.user?.email 
});

// Log info
await log.info("User reseted password", { 
  email: session?.user?.email 
});

// Log error
await log.error("login failed", { 
  email: session?.user?.email 
});
`,
    language: "typescript",
  },
  {
    id: 4,
    title: "Done",
    description: "That's it. No config, no servers, no YAML. Just clear logs.",
    icon: Sparkles,
    code: `// Visit oneminutelogs.com/dashboard/live-logs
// You'll see your events streaming live!
// Or brodcast live logs via our SDK inside your
// application dashboard
`,
    language: "typescript",
  },
];

export function LandingSetup() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Section className="space-y-4" id="integrations">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:justify-between gap-4"
      >
        <Heading>Set up in under a minute.</Heading>
        <SubHeading>
          You don&apos;t need to learn a new system. Just drop in the SDK and
          start seeing logs immediately.
        </SubHeading>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={cn(
                "group relative flex gap-5 p-5 rounded-xl transition-all duration-300 cursor-pointer border",
                activeStep === index
                  ? "bg-neutral`-900/50 border-brand-500/30 shadow-[0_0_20px_-5px_rgba(14,165,233,0.15)]"
                  : "bg-transparent border hover:bg-muted/30 hover:border-input",
              )}
            >
              <div
                className={cn(
                  "shrink-0 h-10 w-10 rounded-full flex items-center justify-center border transition-colors duration-300",
                  activeStep === index
                    ? "bg-brand-500/10 border-brand-500/50 text-brand-400"
                    : "bg-muted border group-hover:border-muted-foreground",
                )}
              >
                <step.icon className="size-5" />
              </div>
              <div>
                <h3
                  className={cn(
                    "text-lg font-semibold transition-colors duration-300",
                    activeStep === index && "text-brand-400",
                    activeStep !== index && " group-hover:text-foreground",
                  )}
                >
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute -inset-1 rounded-lg blur-xl opacity-50" />
          <div className="relative rounded-2xl border border-neutral-500/30 shadow-2xl overflow-hidden">
            <div className="flex items-center bg-muted/40 justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-500" />
                <div className="size-3 rounded-full bg-amber-500" />
                <div className="size-3 rounded-full bg-green-500" />
              </div>
              <div className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                <Terminal className="h-3 w-3" />
                bash
              </div>
            </div>

            <div className="p-6 min-h-75 flex items-center bg-background">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <pre className="font-mono text-sm leading-relaxed overflow-x-auto">
                    <code className="block">
                      {steps[activeStep].code.split("\n").map((line, i) => (
                        <div key={i} className="flex">
                          <span className="text-neutral-400 dark:text-neutral-600 select-none mr-4 w-6 text-right">
                            {i + 1}
                          </span>
                          <span
                            className={
                              line.trim().startsWith("//") ||
                              line.trim().startsWith("#")
                                ? "text-muted-foreground italic font-mono"
                                : steps[activeStep].language === "bash" &&
                                    line.trim().startsWith("npm")
                                  ? "text-brand-300"
                                  : "text-foreground"
                            }
                          >
                            {line}
                          </span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
