"use client";

import { useEffect, useState } from "react";

type TimeFormat = "12" | "24";
type ClockStyle = "both" | "analog" | "digital";

export default function ClockDisplay() {
const [time, setTime] = useState<Date | null>(null);
const [timeFormat, setTimeFormat] = useState<TimeFormat>("12");
const [clockStyle, setClockStyle] = useState<ClockStyle>("both");

useEffect(() => {
const savedFormat = localStorage.getItem("timeFormat");
const savedStyle = localStorage.getItem("clockStyle");


if (savedFormat === "12" || savedFormat === "24") {
  setTimeFormat(savedFormat);
}

if (
  savedStyle === "both" ||
  savedStyle === "analog" ||
  savedStyle === "digital"
) {
  setClockStyle(savedStyle);
}

const updateClock = () => {
  setTime(new Date());
};

updateClock();

const interval = setInterval(updateClock, 1000);

return () => clearInterval(interval);


}, []);

useEffect(() => {
const handleStorage = () => {
const savedFormat = localStorage.getItem("timeFormat");
const savedStyle = localStorage.getItem("clockStyle");


  if (savedFormat === "12" || savedFormat === "24") {
    setTimeFormat(savedFormat);
  }

  if (
    savedStyle === "both" ||
    savedStyle === "analog" ||
    savedStyle === "digital"
  ) {
    setClockStyle(savedStyle);
  }
};

window.addEventListener("storage", handleStorage);

return () => window.removeEventListener("storage", handleStorage);


}, []);

if (!time) {
return ( <div className="flex min-h-[430px] items-center justify-center"> <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" /> </div>
);
}

const hours = time.getHours();
const minutes = time.getMinutes();
const seconds = time.getSeconds();

const displayHours =
timeFormat === "12"
? hours % 12 || 12
: hours;

const hourAngle = ((hours % 12) + minutes / 60) * 30;
const minuteAngle = (minutes + seconds / 60) * 6;
const secondAngle = seconds * 6;

const formattedHours = String(displayHours).padStart(2, "0");
const formattedMinutes = String(minutes).padStart(2, "0");
const formattedSeconds = String(seconds).padStart(2, "0");

const period = hours >= 12 ? "PM" : "AM";

const weekday = time.toLocaleDateString("en-US", {
weekday: "long",
});

const fullDate = time.toLocaleDateString("en-US", {
day: "numeric",
month: "long",
year: "numeric",
});

return ( <section className="relative overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_20px_70px_rgba(0,0,0,0.35)]">


  {/* subtle background glow */}
  <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-200/50 blur-3xl dark:bg-zinc-800/30" />

  <div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">

    {/* top information */}
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-start">

      <div>
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400 sm:text-left">
          Local Time
        </p>

        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400 sm:text-left">
          Your current time zone
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          LIVE
        </span>
      </div>

    </div>

    {/* main clock area */}
    <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">

      {/* digital */}
      {(clockStyle === "both" || clockStyle === "digital") && (
        <div className="text-center lg:text-left">

          <div className="flex items-end justify-center lg:justify-start">

            <div className="font-mono text-[clamp(4rem,11vw,8.5rem)] font-medium leading-none tracking-[-0.08em] text-zinc-950 dark:text-white">
              {formattedHours}:{formattedMinutes}
            </div>

            <div className="mb-2 ml-3 font-mono text-xl font-medium text-zinc-400 sm:text-2xl">
              :{formattedSeconds}
            </div>

          </div>

          {timeFormat === "12" && (
            <div className="mt-4 text-sm font-semibold tracking-[0.3em] text-zinc-400">
              {period}
            </div>
          )}

          <div className="mt-8">
            <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {weekday}
            </div>

            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {fullDate}
            </div>
          </div>

        </div>
      )}

      {/* analog */}
      {(clockStyle === "both" || clockStyle === "analog") && (
        <div className="mx-auto">

          <div className="relative h-[280px] w-[280px] rounded-full border border-zinc-200 bg-zinc-50 shadow-[inset_0_0_40px_rgba(0,0,0,0.04),0_15px_40px_rgba(0,0,0,0.08)] dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-[inset_0_0_40px_rgba(0,0,0,0.25),0_15px_40px_rgba(0,0,0,0.3)] sm:h-[320px] sm:w-[320px]">

            {/* minute markers */}
            {Array.from({ length: 60 }).map((_, index) => {
              const angle = index * 6;
              const isHour = index % 5 === 0;

              return (
                <div
                  key={index}
                  className="absolute left-1/2 top-1/2 origin-center"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  }}
                >
                  <div
                    className={`absolute -top-[145px] left-1/2 -translate-x-1/2 rounded-full ${
                      isHour
                        ? "h-3 w-1.5 bg-zinc-700 dark:bg-zinc-300"
                        : "h-1.5 w-0.5 bg-zinc-300 dark:bg-zinc-700"
                    } sm:-top-[165px]`}
                  />
                </div>
              );
            })}

            {/* 12 */}
            <span className="absolute left-1/2 top-7 -translate-x-1/2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              12
            </span>

            {/* 3 */}
            <span className="absolute right-7 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              3
            </span>

            {/* 6 */}
            <span className="absolute bottom-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              6
            </span>

            {/* 9 */}
            <span className="absolute left-7 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              9
            </span>

            {/* hour hand */}
            <div
              className="absolute left-1/2 top-1/2 h-[72px] w-1.5 origin-bottom rounded-full bg-zinc-900 dark:bg-white"
              style={{
                transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
              }}
            />

            {/* minute hand */}
            <div
              className="absolute left-1/2 top-1/2 h-[96px] w-1 origin-bottom rounded-full bg-zinc-700 dark:bg-zinc-300"
              style={{
                transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
              }}
            />

            {/* second hand */}
            <div
              className="absolute left-1/2 top-1/2 h-[110px] w-[1px] origin-bottom bg-emerald-500"
              style={{
                transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
              }}
            />

            {/* center */}
            <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow dark:border-zinc-900" />

          </div>

        </div>
      )}

    </div>

  </div>
</section>


);
}
