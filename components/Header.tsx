"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pageNames: Record<string, string> = {
"/": "Clock",
"/world-clock": "World Clock",
"/alarm": "Alarm",
"/reminder": "Reminders",
"/timer": "Timer",
"/stopwatch": "Stopwatch",
"/settings": "Settings",
};

export default function Header() {
const pathname = usePathname();
const pageName = pageNames[pathname] ?? "Clock";

return ( <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-zinc-50/85 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-black/85"> <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">


    <Link
      href="/"
      className="group flex items-center gap-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105 dark:bg-white dark:text-zinc-950">
        ◷
      </div>

      <div>
        <p className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
          Clock
        </p>

        <p className="text-[11px] text-zinc-400">
          {pageName}
        </p>
      </div>
    </Link>

    <div className="flex items-center gap-3">

      <div className="hidden rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-500 sm:block dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        {pageName}
      </div>

      <Link
        href="/settings"
        aria-label="Settings"
        title="Settings"
        className={`flex h-10 w-10 items-center justify-center rounded-xl border text-base transition-all ${
          pathname === "/settings"
            ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
        }`}
      >
        ⚙
      </Link>

    </div>

  </div>
</header>


);
}
