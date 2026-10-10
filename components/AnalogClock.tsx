"use client";

import { useEffect, useState } from "react";

export default function AnalogClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Create the date only after the component loads in the browser
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Wait until the browser provides the current time
  if (!time) {
    return (
      <div className="h-72 w-72 animate-pulse rounded-full border border-zinc-800 bg-zinc-900 sm:h-80 sm:w-80" />
    );
  }

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  // Calculate hand angles
  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div className="relative h-72 w-72 rounded-full border border-zinc-700 bg-zinc-900 shadow-2xl sm:h-80 sm:w-80">

      {/* 12 */}
      <span className="absolute left-1/2 top-4 -translate-x-1/2 text-sm font-medium text-zinc-400">
        12
      </span>

      {/* 3 */}
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
        3
      </span>

      {/* 6 */}
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium text-zinc-400">
        6
      </span>

      {/* 9 */}
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
        9
      </span>

      {/* Hour hand */}
      <div
        className="absolute bottom-1/2 left-1/2 h-20 w-1.5 origin-bottom rounded-full bg-white"
        style={{
          transform: `translateX(-50%) rotate(${hourAngle}deg)`,
        }}
      />

      {/* Minute hand */}
      <div
        className="absolute bottom-1/2 left-1/2 h-28 w-1 origin-bottom rounded-full bg-zinc-300"
        style={{
          transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
        }}
      />

      {/* Second hand */}
      <div
        className="absolute bottom-1/2 left-1/2 h-32 w-0.5 origin-bottom rounded-full bg-red-500"
        style={{
          transform: `translateX(-50%) rotate(${secondAngle}deg)`,
        }}
      />

      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg" />

    </div>
  );
}