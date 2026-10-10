
"use client";

import { useEffect, useState } from "react";

type TimeFormat = "12" | "24";
type ClockStyle = "both" | "analog" | "digital";

export default function SettingsPage() {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12");
  const [clockStyle, setClockStyle] = useState<ClockStyle>("both");
  const [notifications, setNotifications] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedTimeFormat = localStorage.getItem("timeFormat");
    const savedClockStyle = localStorage.getItem("clockStyle");
    const savedNotifications = localStorage.getItem("notifications");

    if (savedTimeFormat === "12" || savedTimeFormat === "24") {
      setTimeFormat(savedTimeFormat);
    }

    if (
      savedClockStyle === "both" ||
      savedClockStyle === "analog" ||
      savedClockStyle === "digital"
    ) {
      setClockStyle(savedClockStyle);
    }

    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("timeFormat", timeFormat);
  }, [timeFormat, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("clockStyle", clockStyle);
  }, [clockStyle, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("notifications", String(notifications));
  }, [notifications, loaded]);

  const baseButton =
    "rounded-xl border p-4 transition-colors duration-200";

  const selectedButton =
    "border-white bg-white text-black";

  const unselectedButton =
    "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600";

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <div className="mx-auto min-h-screen max-w-xl px-6 pb-24 pt-10">
        <header>
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
            Clock
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Settings
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Customize your clock experience.
          </p>
        </header>

        {/* TIME FORMAT */}
        <section className="mt-10">
          <h2 className="text-lg font-medium">Time format</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Choose how the time is displayed.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTimeFormat("12")}
              aria-pressed={timeFormat === "12"}
              className={`${baseButton} text-left ${
                timeFormat === "12" ? selectedButton : unselectedButton
              }`}
            >
              <div className="font-medium">12-hour</div>
              <div className="mt-1 text-sm opacity-60">10:30 PM</div>
            </button>

            <button
              type="button"
              onClick={() => setTimeFormat("24")}
              aria-pressed={timeFormat === "24"}
              className={`${baseButton} text-left ${
                timeFormat === "24" ? selectedButton : unselectedButton
              }`}
            >
              <div className="font-medium">24-hour</div>
              <div className="mt-1 text-sm opacity-60">22:30</div>
            </button>
          </div>
        </section>

        {/* CLOCK DISPLAY */}
        <section className="mt-10">
          <h2 className="text-lg font-medium">Clock display</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Select which clock styles you want to use.
          </p>

          <div className="mt-4 space-y-3">
            {[
              {
                value: "both",
                title: "Analog + Digital",
                description: "Show both clock styles",
              },
              {
                value: "analog",
                title: "Analog only",
                description: "Show only the analog clock",
              },
              {
                value: "digital",
                title: "Digital only",
                description: "Show only the digital clock",
              },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setClockStyle(item.value as ClockStyle)}
                aria-pressed={clockStyle === item.value}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors duration-200 ${
                  clockStyle === item.value
                    ? selectedButton
                    : unselectedButton
                }`}
              >
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="mt-1 text-sm opacity-60">
                    {item.description}
                  </div>
                </div>

                {clockStyle === item.value && (
                  <span aria-hidden="true">✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="mt-10">
          <h2 className="text-lg font-medium">Notifications</h2>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div>
              <div className="font-medium">Browser notifications</div>

              <div className="mt-1 text-sm text-zinc-500">
                Enable or disable notification preferences for alarms and timers.
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notifications}
              aria-label="Browser notifications"
              onClick={() => setNotifications((previous) => !previous)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                notifications ? "bg-white" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full transition-all ${
                  notifications
                    ? "right-1 bg-black"
                    : "left-1 bg-zinc-400"
                }`}
              />
            </button>
          </div>

          <p className="mt-3 text-xs text-zinc-600">
            This saves your preference. Browser notification permission may
            still need to be granted separately.
          </p>
        </section>

        <footer className="mt-12 border-t border-zinc-900 pt-5 text-center">
          <p className="text-xs tracking-wide text-zinc-600">
            SIMPLE · PRECISE · ALWAYS ON TIME
          </p>
        </footer>
      </div>
    </main>
  );
}
