
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RepeatType = "once" | "daily" | "weekdays" | "weekends" | "custom";
type SoundType = "classic" | "beep" | "digital" | "gentle";

type Alarm = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  repeat: RepeatType;
  days: number[];
  sound: SoundType;
};

const STORAGE_KEY = "clock-alarms";

const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const SOUND_OPTIONS: { value: SoundType; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "beep", label: "Beep" },
  { value: "digital", label: "Digital" },
  { value: "gentle", label: "Gentle" },
];

function formatTime(time: string, format12Hour: boolean) {
  const [hours, minutes] = time.split(":").map(Number);

  if (!format12Hour) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function getRepeatLabel(alarm: Alarm) {
  if (alarm.repeat === "daily") return "Every day";
  if (alarm.repeat === "weekdays") return "Monday – Friday";
  if (alarm.repeat === "weekends") return "Weekends";
  if (alarm.repeat === "custom") {
    return WEEKDAYS
      .filter((day) => alarm.days.includes(day.value))
      .map((day) => day.label)
      .join(", ") || "Choose days";
  }

  return "Once";
}

function createEmptyAlarm(): Omit<Alarm, "id"> {
  return {
    time: "07:00",
    label: "",
    enabled: true,
    repeat: "once",
    days: [],
    sound: "classic",
  };
}

export default function AlarmPage() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(createEmptyAlarm);
  const [showForm, setShowForm] = useState(false);
  const [format12Hour, setFormat12Hour] = useState(true);
  const [ringing, setRinging] = useState<Alarm | null>(null);
  const [permission, setPermission] = useState("default");

  const audioRef = useRef<AudioContext | null>(null);
  const ringInterval = useRef<number | null>(null);
  const ringTimeout = useRef<number | null>(null);
  const ringingRef = useRef<Alarm | null>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const alarmsRef = useRef<Alarm[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Alarm[] = JSON.parse(saved);
        if (Array.isArray(parsed)) setAlarms(parsed);
      }

      const savedFormat = localStorage.getItem("timeFormat");
      setFormat12Hour(savedFormat !== "24");
    } catch {
      console.warn("Could not load saved alarms.");
    }

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    alarmsRef.current = alarms;

    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    }
  }, [alarms, loaded]);

  const stopRinging = useCallback(() => {
    ringingRef.current = null;
    setRinging(null);

    if (ringInterval.current !== null) {
      window.clearInterval(ringInterval.current);
      ringInterval.current = null;
    }

    if (ringTimeout.current !== null) {
      window.clearTimeout(ringTimeout.current);
      ringTimeout.current = null;
    }

    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }

    if (audioRef.current) {
      void audioRef.current.suspend().catch(() => {});
    }
  }, []);

  const playTone = useCallback(async (sound: SoundType) => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioRef.current) {
        audioRef.current = new AudioContextClass();
      }

      const context = audioRef.current;

      if (context.state === "suspended") {
        await context.resume();
      }

      const frequencies: Record<SoundType, number[]> = {
        classic: [880, 660],
        beep: [1000],
        digital: [660, 880, 1100],
        gentle: [523, 659, 784],
      };

      const notes = frequencies[sound];

      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = sound === "gentle" ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.15,
          context.currentTime + 0.04
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          context.currentTime + 0.35
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        const startAt = context.currentTime + index * 0.12;
        oscillator.start(startAt);
        oscillator.stop(startAt + 0.38);
      });
    } catch (error) {
      console.error("Could not play alarm sound:", error);
    }
  }, []);

  const startRinging = useCallback(
    (alarm: Alarm) => {
      if (ringingRef.current) return;

      ringingRef.current = alarm;
      setRinging(alarm);

      void playTone(alarm.sound);

      ringInterval.current = window.setInterval(() => {
        const current = ringingRef.current;
        if (current) void playTone(current.sound);
      }, 1500);

      ringTimeout.current = window.setTimeout(() => {
        stopRinging();
      }, 20000);

      if ("vibrate" in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }

      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(alarm.label || "Alarm", {
            body: `It's ${formatTime(alarm.time, true)}. Time to wake up!`,
            tag: `alarm-${alarm.id}`,
          });
        } catch {
          // The in-page alarm still works if a notification cannot be shown.
        }
      }
    },
    [playTone, stopRinging]
  );

  useEffect(() => {
    if (!loaded) return;

    const checkAlarms = () => {
      const now = new Date();
      const today = now.getDay();
      const currentTime =
        `${String(now.getHours()).padStart(2, "0")}:` +
        `${String(now.getMinutes()).padStart(2, "0")}`;

      const dateKey = [
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        currentTime,
      ].join("-");

      const matching = alarmsRef.current.find((alarm) => {
        if (!alarm.enabled || alarm.time !== currentTime) return false;

        if (firedRef.current.has(`${alarm.id}-${dateKey}`)) return false;

        if (alarm.repeat === "weekdays" && (today === 0 || today === 6)) {
          return false;
        }

        if (alarm.repeat === "weekends" && today !== 0 && today !== 6) {
          return false;
        }

        if (alarm.repeat === "custom" && !alarm.days.includes(today)) {
          return false;
        }

        return true;
      });

      if (matching) {
        firedRef.current.add(`${matching.id}-${dateKey}`);

        if (matching.repeat === "once") {
          setAlarms((previous) =>
            previous.map((alarm) =>
              alarm.id === matching.id ? { ...alarm, enabled: false } : alarm
            )
          );
        }

        startRinging(matching);
      }

      // Keep the in-memory fired set from growing indefinitely.
      if (firedRef.current.size > 500) {
        firedRef.current.clear();
      }
    };

    checkAlarms();
    const interval = window.setInterval(checkAlarms, 1000);

    return () => window.clearInterval(interval);
  }, [loaded, startRinging]);

  useEffect(() => {
    return () => {
      if (ringInterval.current !== null) {
        window.clearInterval(ringInterval.current);
      }

      if (ringTimeout.current !== null) {
        window.clearTimeout(ringTimeout.current);
      }

      if ("vibrate" in navigator) navigator.vibrate(0);

      if (audioRef.current) {
        void audioRef.current.close().catch(() => {});
      }
    };
  }, []);

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Notifications are not supported by this browser.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const openNewAlarm = () => {
    setEditingId(null);
    setForm(createEmptyAlarm());
    setShowForm(true);
  };

  const openEditAlarm = (alarm: Alarm) => {
    setEditingId(alarm.id);
    setForm({
      time: alarm.time,
      label: alarm.label,
      enabled: alarm.enabled,
      repeat: alarm.repeat,
      days: [...alarm.days],
      sound: alarm.sound,
    });
    setShowForm(true);
  };

  const saveAlarm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.time) {
      alert("Please select an alarm time.");
      return;
    }

    if (form.repeat === "custom" && form.days.length === 0) {
      alert("Please select at least one day.");
      return;
    }

    if (editingId) {
      setAlarms((previous) =>
        previous.map((alarm) =>
          alarm.id === editingId ? { ...form, id: editingId } : alarm
        )
      );
    } else {
      const newAlarm: Alarm = {
        ...form,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };

      setAlarms((previous) =>
        [...previous, newAlarm].sort((a, b) => a.time.localeCompare(b.time))
      );
    }

    setShowForm(false);
    setEditingId(null);
  };

  const deleteAlarm = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this alarm?")) return;

    setAlarms((previous) => previous.filter((alarm) => alarm.id !== id));

    if (editingId === id) setShowForm(false);
  };

  const toggleAlarm = (id: string) => {
    setAlarms((previous) =>
      previous.map((alarm) =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    );
  };

  const toggleDay = (day: number) => {
    setForm((previous) => ({
      ...previous,
      days: previous.days.includes(day)
        ? previous.days.filter((item) => item !== day)
        : [...previous.days, day].sort(),
    }));
  };

  const enabledCount = alarms.filter((alarm) => alarm.enabled).length;

  return (
    <main className="min-h-screen bg-[#070707] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-emerald-400">
              Your daily routine
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Alarms
            </h1>
            <p className="mt-3 text-sm text-neutral-400">
              {enabledCount} active {enabledCount === 1 ? "alarm" : "alarms"}
            </p>
          </div>

          <button
            type="button"
            onClick={openNewAlarm}
            className="rounded-full bg-emerald-400 px-5 py-3 font-semibold text-black transition hover:bg-emerald-300"
          >
            + Add alarm
          </button>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div>
            <p className="font-medium">Time format</p>
            <p className="mt-1 text-sm text-neutral-500">
              Choose how alarm times appear
            </p>
          </div>

          <div className="flex rounded-full border border-white/10 bg-black p-1">
            <button
              type="button"
              onClick={() => setFormat12Hour(true)}
              className={`rounded-full px-4 py-2 text-sm ${
                format12Hour
                  ? "bg-emerald-400 font-semibold text-black"
                  : "text-neutral-400"
              }`}
            >
              12-hour
            </button>
            <button
              type="button"
              onClick={() => setFormat12Hour(false)}
              className={`rounded-full px-4 py-2 text-sm ${
                !format12Hour
                  ? "bg-emerald-400 font-semibold text-black"
                  : "text-neutral-400"
              }`}
            >
              24-hour
            </button>
          </div>
        </div>

        {permission !== "granted" && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium">Browser notifications</p>
              <p className="mt-1 text-sm text-neutral-400">
                Allow notifications for alarm alerts when supported.
              </p>
            </div>
            <button
              type="button"
              onClick={requestNotifications}
              className="rounded-full border border-emerald-400/40 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-400/10"
            >
              Enable notifications
            </button>
          </div>
        )}

        {alarms.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
            <div className="mb-4 text-5xl">◷</div>
            <h2 className="text-xl font-medium">No alarms yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-400">
              Create an alarm for your morning routine, classes, reminders, or
              anything you do not want to miss.
            </p>
            <button
              type="button"
              onClick={openNewAlarm}
              className="mt-6 rounded-full bg-emerald-400 px-5 py-3 font-semibold text-black hover:bg-emerald-300"
            >
              Create your first alarm
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {alarms.map((alarm) => (
              <article
                key={alarm.id}
                className={`rounded-2xl border p-5 transition ${
                  alarm.enabled
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-white/5 bg-white/[0.015] opacity-60"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-4xl font-light tracking-tight sm:text-5xl ${
                        alarm.enabled ? "text-white" : "text-neutral-500"
                      }`}
                    >
                      {formatTime(alarm.time, format12Hour)}
                    </p>

                    <p className="mt-2 truncate text-sm font-medium text-neutral-300">
                      {alarm.label || "Alarm"}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      {getRepeatLabel(alarm)} · {alarm.sound}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={alarm.enabled}
                    aria-label={`${alarm.enabled ? "Disable" : "Enable"} alarm`}
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      alarm.enabled ? "bg-emerald-400" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                        alarm.enabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => openEditAlarm(alarm)}
                    className="rounded-full border border-white/15 px-4 py-2 text-sm text-neutral-300 hover:border-emerald-400/50 hover:text-emerald-300"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void playTone(alarm.sound);
                    }}
                    className="rounded-full border border-white/15 px-4 py-2 text-sm text-neutral-300 hover:border-emerald-400/50 hover:text-emerald-300"
                  >
                    Test sound
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAlarm(alarm.id)}
                    className="rounded-full border border-red-400/20 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs leading-6 text-neutral-600">
          Keep this page open for alarms to trigger reliably. Browser
          notifications and vibration depend on your browser, device, and
          permissions.
        </p>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-[#101010] p-6 sm:rounded-3xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">
                {editingId ? "Edit alarm" : "New alarm"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close"
                className="rounded-full px-3 py-2 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveAlarm} className="space-y-5">
              <div>
                <label
                  htmlFor="alarm-time"
                  className="mb-2 block text-sm text-neutral-400"
                >
                  Alarm time
                </label>
                <input
                  id="alarm-time"
                  type="time"
                  required
                  value={form.time}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      time: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-4 text-3xl text-white outline-none focus:border-emerald-400"
                />
                <p className="mt-2 text-xs text-neutral-500">
                  Preview: {formatTime(form.time, format12Hour)}
                </p>
              </div>

              <div>
                <label
                  htmlFor="alarm-label"
                  className="mb-2 block text-sm text-neutral-400"
                >
                  Label
                </label>
                <input
                  id="alarm-label"
                  type="text"
                  maxLength={60}
                  placeholder="e.g. Wake up, College, Study"
                  value={form.label}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      label: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none placeholder:text-neutral-600 focus:border-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="alarm-repeat"
                  className="mb-2 block text-sm text-neutral-400"
                >
                  Repeat
                </label>
                <select
                  id="alarm-repeat"
                  value={form.repeat}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      repeat: event.target.value as RepeatType,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-emerald-400"
                >
                  <option value="once">Once</option>
                  <option value="daily">Every day</option>
                  <option value="weekdays">Monday – Friday</option>
                  <option value="weekends">Weekends</option>
                  <option value="custom">Custom days</option>
                </select>
              </div>

              {form.repeat === "custom" && (
                <div>
                  <p className="mb-3 text-sm text-neutral-400">
                    Select days
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day) => {
                      const selected = form.days.includes(day.value);

                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          aria-pressed={selected}
                          className={`h-11 min-w-11 rounded-full border px-3 text-sm ${
                            selected
                              ? "border-emerald-400 bg-emerald-400 text-black"
                              : "border-white/15 text-neutral-300 hover:border-emerald-400/50"
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="alarm-sound"
                  className="mb-2 block text-sm text-neutral-400"
                >
                  Alarm sound
                </label>
                <div className="flex gap-2">
                  <select
                    id="alarm-sound"
                    value={form.sound}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        sound: event.target.value as SoundType,
                      }))
                    }
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-emerald-400"
                  >
                    {SOUND_OPTIONS.map((sound) => (
                      <option key={sound.value} value={sound.value}>
                        {sound.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      void playTone(form.sound);
                    }}
                    className="rounded-xl border border-emerald-400/40 px-4 py-3 text-sm text-emerald-300 hover:bg-emerald-400/10"
                  >
                    Preview
                  </button>
                </div>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-4">
                <span>
                  <span className="block font-medium">Alarm enabled</span>
                  <span className="mt-1 block text-xs text-neutral-500">
                    Turn on this alarm after saving
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      enabled: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-emerald-400"
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-full border border-white/15 px-4 py-3 font-medium text-neutral-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-emerald-400 px-4 py-3 font-semibold text-black hover:bg-emerald-300"
                >
                  Save alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {ringing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-5 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-emerald-400/30 bg-[#101010] p-8 text-center shadow-2xl shadow-emerald-400/10">
            <div className="mb-5 text-5xl">⏰</div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
              Alarm ringing
            </p>
            <h2 className="mt-4 text-5xl font-light">
              {formatTime(ringing.time, format12Hour)}
            </h2>
            <p className="mt-3 text-lg text-neutral-300">
              {ringing.label || "Time to wake up!"}
            </p>
            <button
              type="button"
              onClick={stopRinging}
              className="mt-8 w-full rounded-full bg-emerald-400 px-5 py-4 font-semibold text-black hover:bg-emerald-300"
            >
              Stop alarm
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
