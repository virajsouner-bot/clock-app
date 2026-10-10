"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
{
name: "Clock",
href: "/",
icon: "◷",
},
{
name: "World",
href: "/world-clock",
icon: "◎",
},
{
name: "Alarm",
href: "/alarm",
icon: "◉",
},
{
name: "Reminder",
href: "/reminder",
icon: "✓",
},
{
name: "Timer",
href: "/timer",
icon: "◌",
},
{
name: "Stopwatch",
href: "/stopwatch",
icon: "◍",
},
];

export default function BottomNav() {
const pathname = usePathname();

return ( <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-black/90"> <div className="mx-auto flex h-[76px] max-w-2xl items-center justify-center gap-1 overflow-x-auto px-3 sm:gap-2">


    {navigation.map((item) => {
      const active = pathname === item.href;

      return (
        <Link
          key={item.href}
          href={item.href}
          className={`flex min-w-[62px] flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-2 transition-all ${
            active
              ? "bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950"
              : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <span className="text-lg leading-none">
            {item.icon}
          </span>

          <span className="text-[10px] font-medium">
            {item.name}
          </span>
        </Link>
      );
    })}

  </div>
</nav>


);
}
