import React from "react";
import {
  LandingHero,
  LandingTrustedBy,
  LandingFeatures,
  LandingSetup,
  LandingTestimonials,
  LandingWhySwitch,
  LandingPricing,
  LandingCTA,
} from "@/components/landing";
import { LandingHeader } from "@/components/layouts/header";
import { LandingFooter } from "@/components/layouts/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen border-x max-w-5xl mx-auto flex flex-col antialiased">
      <LandingHeader />

      <main className="flex-1">
        <LandingHero />
        <LandingTrustedBy />
        <LandingFeatures />
        <LandingSetup />
        <LandingTestimonials />
        <LandingWhySwitch />
        <LandingPricing />
        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
