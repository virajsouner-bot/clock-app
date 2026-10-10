"use client";

import { useEffect, useState } from "react";

export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime((previousTime) => previousTime + 10);
    }, 10);

    return () => clearInterval(interval);
  }, [running]);

  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  const formattedTime =
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}.` +
    `${String(milliseconds).padStart(2, "0")}`;

  const startPause = () => {
    setRunning((previousRunning) => !previousRunning);
  };

  const reset = () => {
    setRunning(false);
    setTime(0);
    setLaps([]);
  };

  const addLap = () => {
    if (time === 0) return;

    setLaps((previousLaps) => [
      ...previousLaps,
      time,
    ]);
  };

  const formatLap = (lapTime: number) => {
    const lapMinutes = Math.floor(lapTime / 60000);
    const lapSeconds = Math.floor((lapTime % 60000) / 1000);
    const lapMilliseconds = Math.floor((lapTime % 1000) / 10);

    return (
      `${String(lapMinutes).padStart(2, "0")}:` +
      `${String(lapSeconds).padStart(2, "0")}.` +
      `${String(lapMilliseconds).padStart(2, "0")}`
    );
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-6 pb-24 pt-10">

        {/* Header */}
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
            Clock
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Stopwatch
          </h1>
        </div>

        {/* Stopwatch */}
        <div className="flex flex-1 flex-col items-center justify-center">

          <div className="text-6xl font-semibold tracking-tight sm:text-7xl">
            {formattedTime}
          </div>

          {/* Buttons */}
          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              onClick={startPause}
              className="rounded-full bg-white px-8 py-4 font-medium text-black transition hover:bg-zinc-200"
            >
              {running ? "Pause" : "Start"}
            </button>

            <button
              type="button"
              onClick={addLap}
              disabled={!running}
              className="rounded-full border border-zinc-700 px-6 py-4 text-zinc-300 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Lap
            </button>

            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-zinc-700 px-6 py-4 text-zinc-300 transition hover:bg-zinc-900"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Laps */}
        {laps.length > 0 && (
          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium">
                Laps
              </h2>

              <span className="text-sm text-zinc-500">
                {laps.length}
              </span>
            </div>

            <div className="max-h-52 space-y-2 overflow-y-auto">
              {laps
                .slice()
                .reverse()
                .map((lap, index) => (
                  <div
                    key={`${lap}-${index}`}
                    className="flex items-center justify-between border-b border-zinc-800 py-3 last:border-0"
                  >
                    <span className="text-sm text-zinc-500">
                      Lap {laps.length - index}
                    </span>

                    <span className="font-mono text-sm">
                      {formatLap(lap)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}