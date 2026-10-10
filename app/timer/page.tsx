
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TimerSound =
  | "classic"
  | "beep"
  | "digital"
  | "gentle";

type TimerPreset = {
  label: string;
  minutes: number;
};

const PRESETS: TimerPreset[] = [
  { label: "1 min", minutes: 1 },
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
  { label: "15 min", minutes: 15 },
  { label: "25 min", minutes: 25 },
  { label: "30 min", minutes: 30 },
];

const SOUND_NAMES: Record<TimerSound, string> = {
  classic: "Classic",
  beep: "Beep",
  digital: "Digital",
  gentle: "Gentle",
};

export default function TimerPage() {
  const [inputMinutes, setInputMinutes] = useState(5);
  const [inputSeconds, setInputSeconds] = useState(0);

  const [totalTime, setTotalTime] = useState(
    5 * 60 * 1000
  );

  const [timeLeft, setTimeLeft] = useState(
    5 * 60 * 1000
  );

  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const [sound, setSound] =
    useState<TimerSound>("classic");

  // Exact timestamp at which the timer should finish.
  const [endTime, setEndTime] =
    useState<number | null>(null);

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const soundIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  // -----------------------------------------
  // AUDIO
  // -----------------------------------------

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      audioContextRef.current =
        new AudioContextClass();
    }

    return audioContextRef.current;
  };

  const playSound = (
    selectedSound: TimerSound
  ) => {
    const context = getAudioContext();

    if (!context) return;

    if (context.state === "suspended") {
      context.resume();
    }

    const now = context.currentTime;

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    if (selectedSound === "classic") {
      oscillator.frequency.setValueAtTime(
        880,
        now
      );

      oscillator.frequency.setValueAtTime(
        660,
        now + 0.25
      );
    }

    if (selectedSound === "beep") {
      oscillator.frequency.setValueAtTime(
        1000,
        now
      );
    }

    if (selectedSound === "digital") {
      oscillator.frequency.setValueAtTime(
        1400,
        now
      );

      oscillator.frequency.setValueAtTime(
        900,
        now + 0.15
      );
    }

    if (selectedSound === "gentle") {
      oscillator.frequency.setValueAtTime(
        520,
        now
      );

      oscillator.frequency.setValueAtTime(
        700,
        now + 0.3
      );
    }

    gain.gain.setValueAtTime(
      0.0001,
      now
    );

    gain.gain.exponentialRampToValueAtTime(
      0.25,
      now + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.55
    );

    oscillator.start(now);
    oscillator.stop(now + 0.6);
  };

  const stopFinishSound = () => {
    if (soundIntervalRef.current) {
      clearInterval(
        soundIntervalRef.current
      );

      soundIntervalRef.current = null;
    }
  };

  const startFinishSound = () => {
    stopFinishSound();

    playSound(sound);

    soundIntervalRef.current =
      setInterval(() => {
        playSound(sound);
      }, 900);
  };

  // -----------------------------------------
  // FINISH TIMER
  // -----------------------------------------

  const finishTimer = () => {
    setRunning(false);
    setEndTime(null);
    setTimeLeft(0);
    setFinished(true);

    startFinishSound();

    if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification("Timer Finished", {
        body: "Your timer has finished.",
      });
    }

    if ("vibrate" in navigator) {
      navigator.vibrate(2000);
    }
  };

  // -----------------------------------------
  // ACCURATE COUNTDOWN
  // -----------------------------------------

  useEffect(() => {
    if (!running || endTime === null) {
      return;
    }

    const updateTimer = () => {
      const remaining =
        Math.max(
          0,
          endTime - Date.now()
        );

      setTimeLeft(remaining);

      if (remaining <= 0) {
        finishTimer();
      }
    };

    updateTimer();

    const interval =
      setInterval(updateTimer, 100);

    return () => {
      clearInterval(interval);
    };
  }, [running, endTime]);

  // -----------------------------------------
  // FORMAT TIME
  // -----------------------------------------

  const formattedTime = useMemo(() => {
    const totalSeconds = Math.ceil(
      timeLeft / 1000
    );

    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds =
      totalSeconds % 60;

    if (hours > 0) {
      return (
        `${String(hours).padStart(
          2,
          "0"
        )}:` +
        `${String(minutes).padStart(
          2,
          "0"
        )}:` +
        `${String(seconds).padStart(
          2,
          "0"
        )}`
      );
    }

    return (
      `${String(minutes).padStart(
        2,
        "0"
      )}:` +
      `${String(seconds).padStart(
        2,
        "0"
      )}`
    );
  }, [timeLeft]);

  // -----------------------------------------
  // PROGRESS
  // -----------------------------------------

  const progress =
    totalTime > 0
      ? Math.max(
          0,
          Math.min(
            1,
            timeLeft / totalTime
          )
        )
      : 0;

  const circumference =
    2 * Math.PI * 125;

  const strokeOffset =
    circumference *
    (1 - progress);

  // -----------------------------------------
  // APPLY TIMER
  // -----------------------------------------

  const applyTimer = (
    minutes: number,
    seconds: number
  ) => {
    const safeMinutes = Math.max(
      0,
      Math.floor(minutes)
    );

    const safeSeconds = Math.max(
      0,
      Math.min(
        59,
        Math.floor(seconds)
      )
    );

    const milliseconds =
      (safeMinutes * 60 +
        safeSeconds) *
      1000;

    setInputMinutes(
      safeMinutes
    );

    setInputSeconds(
      safeSeconds
    );

    setTotalTime(
      milliseconds
    );

    setTimeLeft(
      milliseconds
    );

    setEndTime(null);
    setRunning(false);
    setFinished(false);

    stopFinishSound();

    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
  };

  // -----------------------------------------
  // START / PAUSE
  // -----------------------------------------

  const startPause = async () => {
    if (timeLeft <= 0) {
      return;
    }

    const context =
      getAudioContext();

    if (context) {
      await context.resume();
    }

    if (!running) {
      // Start from the exact current time.
      setEndTime(
        Date.now() + timeLeft
      );
    } else {
      // Pause:
      // timeLeft is already accurate because
      // it has been calculated from endTime.
      setEndTime(null);
    }

    setRunning(
      (previous) => !previous
    );

    if (
      !running &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      await Notification.requestPermission();
    }
  };

  // -----------------------------------------
  // RESET
  // -----------------------------------------

  const resetTimer = () => {
    setRunning(false);
    setEndTime(null);
    setFinished(false);

    setTimeLeft(totalTime);

    stopFinishSound();

    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
  };

  // -----------------------------------------
  // PRESET
  // -----------------------------------------

  const selectPreset = (
    minutes: number
  ) => {
    applyTimer(minutes, 0);
  };

  // -----------------------------------------
  // SOUND PREVIEW
  // -----------------------------------------

  const previewSound = (
    selectedSound: TimerSound
  ) => {
    playSound(selectedSound);
  };

  // -----------------------------------------
  // FINISHED SCREEN
  // -----------------------------------------

  const dismissFinished = () => {
    stopFinishSound();

    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }

    setFinished(false);

    if (repeat) {
      setTimeLeft(totalTime);

      setEndTime(
        Date.now() + totalTime
      );

      setRunning(true);
    } else {
      setTimeLeft(totalTime);
      setEndTime(null);
      setRunning(false);
    }
  };

  // -----------------------------------------
  // CLEANUP
  // -----------------------------------------

  useEffect(() => {
    return () => {
      stopFinishSound();

      if ("vibrate" in navigator) {
        navigator.vibrate(0);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // -----------------------------------------
  // FINISHED SCREEN
  // -----------------------------------------

  if (finished) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">

        <div className="w-full max-w-md text-center">

          <div className="text-7xl">
            ⏰
          </div>

          <p className="mt-6 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Timer
          </p>

          <h1 className="mt-4 text-5xl font-semibold">
            Time's up
          </h1>

          <p className="mt-4 text-zinc-500">
            Your timer has finished.
          </p>

          <div className="mt-8 space-y-3">

            <button
              type="button"
              onClick={dismissFinished}
              className="w-full rounded-2xl bg-white py-4 font-semibold text-black transition hover:bg-zinc-200"
            >
              {repeat
                ? "Restart Timer"
                : "Done"}
            </button>

            <button
              type="button"
              onClick={() => {
                stopFinishSound();

                if (
                  "vibrate" in
                  navigator
                ) {
                  navigator.vibrate(0);
                }
              }}
              className="w-full rounded-2xl border border-zinc-700 py-4 text-zinc-300 transition hover:bg-zinc-900"
            >
              Stop Sound
            </button>

          </div>

        </div>

      </main>
    );
  }

  // -----------------------------------------
  // MAIN PAGE
  // -----------------------------------------

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      <div className="mx-auto min-h-screen max-w-xl px-6 pb-24 pt-10">

        {/* HEADER */}

        <div>

          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
            Clock
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Timer
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Countdown anything.
          </p>

        </div>

        {/* TIMER */}

        <div className="mt-12 flex flex-col items-center">

          <div className="relative h-72 w-72">

            <svg
              className="h-full w-full -rotate-90"
              viewBox="0 0 280 280"
            >

              <circle
                cx="140"
                cy="140"
                r="125"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-900"
              />

              <circle
                cx="140"
                cy="140"
                r="125"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={
                  timeLeft === 0
                    ? "text-red-500"
                    : "text-white"
                }
                strokeDasharray={
                  circumference
                }
                strokeDashoffset={
                  strokeOffset
                }
              />

            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <div className="text-5xl font-semibold tracking-tight sm:text-6xl">
                {formattedTime}
              </div>

              <p className="mt-3 text-sm text-zinc-500">
                {running
                  ? "Running"
                  : "Paused"}
              </p>

            </div>

          </div>

          {/* CONTROLS */}

          <div className="mt-8 flex gap-3">

            <button
              type="button"
              onClick={startPause}
              disabled={
                timeLeft === 0
              }
              className="rounded-full bg-white px-9 py-4 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {running
                ? "Pause"
                : "Start"}
            </button>

            <button
              type="button"
              onClick={resetTimer}
              className="rounded-full border border-zinc-700 px-8 py-4 text-zinc-300 transition hover:bg-zinc-900"
            >
              Reset
            </button>

          </div>

        </div>

        {/* QUICK PRESETS */}

        <section className="mt-12">

          <div className="flex items-center justify-between">

            <h2 className="font-medium">
              Quick timer
            </h2>

            <span className="text-xs text-zinc-600">
              Presets
            </span>

          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">

            {PRESETS.map(
              (preset) => (
                <button
                  key={
                    preset.minutes
                  }
                  type="button"
                  onClick={() =>
                    selectPreset(
                      preset.minutes
                    )
                  }
                  className="rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  {preset.label}
                </button>
              )
            )}

          </div>

        </section>

        {/* CUSTOM TIMER */}

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">

          <h2 className="font-medium">
            Custom timer
          </h2>

          <div className="mt-4 flex gap-3">

            <div className="flex-1">

              <label className="mb-2 block text-xs text-zinc-500">
                Minutes
              </label>

              <input
                type="number"
                min="0"
                value={inputMinutes}
                onChange={(event) =>
                  setInputMinutes(
                    Math.max(
                      0,
                      Number(
                        event
                          .target
                          .value
                      )
                    )
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-400"
              />

            </div>

            <div className="flex-1">

              <label className="mb-2 block text-xs text-zinc-500">
                Seconds
              </label>

              <input
                type="number"
                min="0"
                max="59"
                value={inputSeconds}
                onChange={(event) =>
                  setInputSeconds(
                    Math.min(
                      59,
                      Math.max(
                        0,
                        Number(
                          event
                            .target
                            .value
                        )
                      )
                    )
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-400"
              />

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              applyTimer(
                inputMinutes,
                inputSeconds
              )
            }
            className="mt-4 w-full rounded-xl bg-white py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            Set Timer
          </button>

        </section>

        {/* REPEAT */}

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-medium">
                Repeat timer
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Automatically restart when finished.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setRepeat(
                  (previous) =>
                    !previous
                )
              }
              className={`relative h-7 w-12 rounded-full transition ${
                repeat
                  ? "bg-white"
                  : "bg-zinc-700"
              }`}
            >

              <span
                className={`absolute top-1 h-5 w-5 rounded-full transition ${
                  repeat
                    ? "right-1 bg-black"
                    : "left-1 bg-zinc-400"
                }`}
              />

            </button>

          </div>

        </section>

        {/* SOUND */}

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">

          <h2 className="font-medium">
            Timer sound
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Choose the sound played when the timer finishes.
          </p>

          <div className="mt-4 space-y-2">

            {(
              Object.keys(
                SOUND_NAMES
              ) as TimerSound[]
            ).map(
              (selectedSound) => (
                <div
                  key={
                    selectedSound
                  }
                  className={`flex items-center justify-between rounded-xl border p-3 ${
                    sound ===
                    selectedSound
                      ? "border-zinc-500 bg-zinc-900"
                      : "border-zinc-800 bg-zinc-950"
                  }`}
                >

                  <button
                    type="button"
                    onClick={() =>
                      setSound(
                        selectedSound
                      )
                    }
                    className="flex-1 text-left text-sm"
                  >
                    {
                      SOUND_NAMES[
                        selectedSound
                      ]
                    }
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      previewSound(
                        selectedSound
                      )
                    }
                    className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                  >
                    ▶ Preview
                  </button>

                </div>
              )
            )}

          </div>

        </section>

      </div>

    </main>
  );
}

