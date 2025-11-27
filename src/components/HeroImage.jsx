import React from "react";
import heroIllustration from "../assets/hero.svg";
import { Button } from "./ui/button";

export default function HeroImage() {
  return (
    <section className="py-16">
      <div className="container-centered">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="hero-card">
            <h1 className="h1">Create pro videos, audio & images with AI</h1>
            <p className="lead">
              NovaVid gives creators AI tools to accelerate editing—export faster, collaborate,
              and scale your multimedia content pipeline.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Button className="cta-btn">Get started — it's free</Button>
              <a className="text-slate-300 hover:text-white" href="/pricing">See pricing</a>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-400">
              <li>• Fast exports (4K)</li>
              <li>• AI background removal</li>
              <li>• Collaborative projects</li>
              <li>• Offline-first sync</li>
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img src={heroIllustration} alt="NovaVid — AI multimedia" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}