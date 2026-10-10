
"use client";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import ClockDisplay from "../components/ClockDisplay";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#070707] text-white">
      <Header />

      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[140px]" />

        <div className="absolute bottom-[-300px] right-[-200px] h-[500px] w-[500px] bg-white/[0.015] blur-[120px]" />
      </div>

      {/* Main clock area */}
      <section className="relative z-10 mx-auto min-h-[calc(100vh-72px)] max-w-6xl px-5 pb-28 sm:px-8">
        <div className="flex items-center justify-between pt-7 sm:pt-10">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.4em] text-zinc-600">
              Local time
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Your current time
            </p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute h-full w-full animate-ping rounded-full bg-zinc-400 opacity-50" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-zinc-400" />
            </span>

            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
              Live
            </span>
          </div>
        </div>

        {/* Clock display */}
        <div className="flex justify-center py-12 sm:py-16 lg:py-20">
          <div className="w-full max-w-5xl">
            <ClockDisplay />
          </div>
        </div>

        {/* Bottom divider */}
        <div className="mx-auto max-w-4xl border-t border-white/[0.05]" />

        {/* Footer text */}
        <div className="mt-10 text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-700">
            Simple · Precise · Always on time
          </p>
        </div>
      </section>

      {/* Bottom navigation */}
      <BottomNav />
    </main>
  );
}
