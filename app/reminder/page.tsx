"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

type RepeatType =
| "once"
| "daily"
| "weekdays"
| "weekends"
| "custom";

type ReminderSound =
| "classic"
| "beep"
| "digital"
| "gentle";

type FilterType =
| "all"
| "upcoming"
| "completed";

type Reminder = {
id: string;
title: string;
description: string;
date: string;
time: string;
repeat: RepeatType;
days: number[];
sound: ReminderSound;
enabled: boolean;
completed: boolean;
createdAt: number;
lastTriggered?: string;
};

const DAYS = [
{ value: 0, label: "Sun", short: "S" },
{ value: 1, label: "Mon", short: "M" },
{ value: 2, label: "Tue", short: "T" },
{ value: 3, label: "Wed", short: "W" },
{ value: 4, label: "Thu", short: "T" },
{ value: 5, label: "Fri", short: "F" },
{ value: 6, label: "Sat", short: "S" },
];

const SOUND_OPTIONS: {
value: ReminderSound;
label: string;
}[] = [
{
value: "classic",
label: "Classic",
},
{
value: "beep",
label: "Beep",
},
{
value: "digital",
label: "Digital",
},
{
value: "gentle",
label: "Gentle",
},
];

export default function ReminderPage() {
const [reminders, setReminders] =
useState<Reminder[]>([]);

const [mounted, setMounted] =
useState(false);

const [showForm, setShowForm] =
useState(false);

const [editingId, setEditingId] =
useState<string | null>(null);

const [activeFilter, setActiveFilter] =
useState<FilterType>("all");

const [search, setSearch] =
useState("");

const [ringingReminder, setRingingReminder] =
useState<Reminder | null>(null);

const [snoozeMinutes, setSnoozeMinutes] =
useState(5);

const [timeFormat, setTimeFormat] =
useState<"12" | "24">("12");

const [notificationPermission, setNotificationPermission] =
useState("default");

const [title, setTitle] =
useState("");

const [description, setDescription] =
useState("");

const [date, setDate] =
useState("");

const [time, setTime] =
useState("");

const [repeat, setRepeat] =
useState<RepeatType>("once");

const [days, setDays] =
useState<number[]>([]);

const [sound, setSound] =
useState<ReminderSound>("classic");

const [enabled, setEnabled] =
useState(true);

const audioContextRef =
useRef<AudioContext | null>(null);

const soundIntervalRef =
useRef<ReturnType<typeof setInterval> | null>(null);

const defaultDateTime = () => {
const now = new Date();


now.setMinutes(
  now.getMinutes() + 5
);

return {
  date: formatDateInput(now),
  time:
    `${String(now.getHours()).padStart(2, "0")}:` +
    `${String(now.getMinutes()).padStart(2, "0")}`,
};


};

useEffect(() => {
const saved =
localStorage.getItem(
"clock-reminders"
);


if (saved) {
  try {
    const parsed =
      JSON.parse(saved);

    if (Array.isArray(parsed)) {
      setReminders(
        parsed.map(normalizeReminder)
      );
    }
  } catch {
    setReminders([]);
  }
}

const savedFormat =
  localStorage.getItem(
    "timeFormat"
  );

if (
  savedFormat === "12" ||
  savedFormat === "24"
) {
  setTimeFormat(savedFormat);
}

if ("Notification" in window) {
  setNotificationPermission(
    Notification.permission
  );
}

const defaults =
  defaultDateTime();

setDate(defaults.date);
setTime(defaults.time);

setMounted(true);


}, []);

useEffect(() => {
if (!mounted) return;


localStorage.setItem(
  "clock-reminders",
  JSON.stringify(reminders)
);


}, [reminders, mounted]);

useEffect(() => {
if (!mounted) return;


const savedFormat =
  localStorage.getItem(
    "timeFormat"
  );

if (
  savedFormat === "12" ||
  savedFormat === "24"
) {
  setTimeFormat(savedFormat);
}


}, [mounted]);

useEffect(() => {
if (!mounted) return;


const interval =
  setInterval(() => {
    checkReminders();
  }, 1000);

checkReminders();

return () =>
  clearInterval(interval);


}, [mounted, reminders]);

useEffect(() => {
return () => {
stopSound();


  if (
    audioContextRef.current
  ) {
    audioContextRef.current.close();
  }
};

}, []);

const filteredReminders =
useMemo(() => {
const query =
search.trim().toLowerCase();


  let result =
    reminders.filter(
      (reminder) => {
        if (!query) return true;

        return (
          reminder.title
            .toLowerCase()
            .includes(query) ||
          reminder.description
            .toLowerCase()
            .includes(query)
        );
      }
    );

  if (
    activeFilter ===
    "completed"
  ) {
    result = result.filter(
      (reminder) =>
        reminder.completed
    );
  }

  if (
    activeFilter ===
    "upcoming"
  ) {
    result = result.filter(
      (reminder) =>
        !reminder.completed &&
        reminder.enabled
    );
  }

  return result.sort(
    (a, b) =>
      getNextOccurrence(a) -
      getNextOccurrence(b)
  );
}, [
  reminders,
  activeFilter,
  search,
]);


const upcomingCount =
reminders.filter(
(reminder) =>
!reminder.completed &&
reminder.enabled
).length;

const completedCount =
reminders.filter(
(reminder) =>
reminder.completed
).length;

const openNewForm = () => {
const defaults =
defaultDateTime();


setEditingId(null);
setTitle("");
setDescription("");
setDate(defaults.date);
setTime(defaults.time);
setRepeat("once");
setDays([]);
setSound("classic");
setEnabled(true);
setShowForm(true);


};

const openEditForm = (
reminder: Reminder
) => {
setEditingId(reminder.id);
setTitle(reminder.title);
setDescription(
reminder.description
);
setDate(reminder.date);
setTime(reminder.time);
setRepeat(reminder.repeat);
setDays([...reminder.days]);
setSound(reminder.sound);
setEnabled(reminder.enabled);
setShowForm(true);
};

const closeForm = () => {
setShowForm(false);
setEditingId(null);
};

const saveReminder = async () => {
if (
!title.trim() ||
!date ||
!time
) {
return;
}


if (
  repeat === "custom" &&
  days.length === 0
) {
  return;
}

await requestNotifications();

if (editingId) {
  setReminders(
    (current) =>
      current.map(
        (reminder) =>
          reminder.id === editingId
            ? {
                ...reminder,
                title:
                  title.trim(),
                description:
                  description.trim(),
                date,
                time,
                repeat,
                days: [...days],
                sound,
                enabled,
                completed:
                  repeat === "once"
                    ? reminder.completed
                    : false,
                lastTriggered:
                  undefined,
              }
            : reminder
      )
  );
} else {
  const newReminder: Reminder = {
    id: createId(),
    title:
      title.trim(),
    description:
      description.trim(),
    date,
    time,
    repeat,
    days: [...days],
    sound,
    enabled,
    completed: false,
    createdAt: Date.now(),
  };

  setReminders(
    (current) => [
      ...current,
      newReminder,
    ]
  );
}

closeForm();


};

const deleteReminder = (
id: string
) => {
const confirmed =
window.confirm(
"Delete this reminder?"
);


if (!confirmed) return;

setReminders(
  (current) =>
    current.filter(
      (reminder) =>
        reminder.id !== id
    )
);


};

const toggleEnabled = (
id: string
) => {
setReminders(
(current) =>
current.map(
(reminder) =>
reminder.id === id
? {
...reminder,
enabled:
!reminder.enabled,
}
: reminder
)
);
};

const toggleCompleted = (
id: string
) => {
setReminders(
(current) =>
current.map(
(reminder) =>
reminder.id === id
? {
...reminder,
completed:
!reminder.completed,
}
: reminder
)
);
};

const toggleDay = (
day: number
) => {
setDays((current) =>
current.includes(day)
? current.filter(
(item) =>
item !== day
)
: [...current, day].sort()
);
};

const checkReminders = () => {
const now = new Date();


for (const reminder of reminders) {
  if (
    !reminder.enabled ||
    reminder.completed
  ) {
    continue;
  }

  if (
    shouldTriggerReminder(
      reminder,
      now
    )
  ) {
    triggerReminder(reminder);
  }
}


};

const triggerReminder = (
reminder: Reminder
) => {
const occurrenceKey =
getOccurrenceKey(
reminder,
new Date()
);


if (
  reminder.lastTriggered ===
  occurrenceKey
) {
  return;
}

setReminders(
  (current) =>
    current.map(
      (item) =>
        item.id === reminder.id
          ? {
              ...item,
              lastTriggered:
                occurrenceKey,
              completed:
                item.repeat ===
                "once",
            }
          : item
    )
);

setRingingReminder(
  reminder
);

playSound(
  reminder.sound
);

vibrate();

sendNotification(
  reminder
);


};

const stopReminder = () => {
stopSound();
setRingingReminder(null);
};

const snoozeReminder = () => {
if (!ringingReminder) {
return;
}


const now = new Date();

now.setMinutes(
  now.getMinutes() +
    snoozeMinutes
);

const snoozed: Reminder = {
  ...ringingReminder,
  id: createId(),
  title:
    `${ringingReminder.title} (Snoozed)`,
  date:
    formatDateInput(now),
  time:
    `${String(
      now.getHours()
    ).padStart(2, "0")}:` +
    `${String(
      now.getMinutes()
    ).padStart(2, "0")}`,
  repeat: "once",
  days: [],
  completed: false,
  enabled: true,
  lastTriggered:
    undefined,
  createdAt:
    Date.now(),
};

setReminders(
  (current) => [
    ...current,
    snoozed,
  ]
);

stopReminder();


};

const previewSound = (
selectedSound: ReminderSound
) => {
playSound(
selectedSound,
true
);
};

const playSound = (
selectedSound: ReminderSound,
preview = false
) => {
stopSound();


const AudioContextClass =
  window.AudioContext ||
  (
    window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }
  ).webkitAudioContext;

if (!AudioContextClass) {
  return;
}

const context =
  audioContextRef.current ||
  new AudioContextClass();

audioContextRef.current =
  context;

if (
  context.state ===
  "suspended"
) {
  context.resume();
}

const playTone = (
  frequency: number,
  duration: number,
  delay: number,
  volume: number
) => {
  const oscillator =
    context.createOscillator();

  const gain =
    context.createGain();

  oscillator.type =
    selectedSound ===
    "digital"
      ? "square"
      : selectedSound ===
        "gentle"
      ? "sine"
      : "triangle";

  oscillator.frequency.value =
    frequency;

  gain.gain.setValueAtTime(
    0,
    context.currentTime +
      delay
  );

  gain.gain.linearRampToValueAtTime(
    volume,
    context.currentTime +
      delay +
      0.02
  );

  gain.gain.linearRampToValueAtTime(
    0,
    context.currentTime +
      delay +
      duration
  );

  oscillator.connect(gain);
  gain.connect(
    context.destination
  );

  oscillator.start(
    context.currentTime +
      delay
  );

  oscillator.stop(
    context.currentTime +
      delay +
      duration +
      0.05
  );
};

const playPattern = () => {
  if (
    selectedSound ===
    "classic"
  ) {
    playTone(
      880,
      0.16,
      0,
      0.12
    );

    playTone(
      660,
      0.16,
      0.22,
      0.12
    );
  }

  if (
    selectedSound ===
    "beep"
  ) {
    playTone(
      1000,
      0.18,
      0,
      0.12
    );
  }

  if (
    selectedSound ===
    "digital"
  ) {
    playTone(
      1200,
      0.08,
      0,
      0.08
    );

    playTone(
      800,
      0.08,
      0.14,
      0.08
    );
  }

  if (
    selectedSound ===
    "gentle"
  ) {
    playTone(
      523,
      0.25,
      0,
      0.08
    );

    playTone(
      659,
      0.3,
      0.3,
      0.08
    );
  }
};

playPattern();

if (!preview) {
  soundIntervalRef.current =
    setInterval(
      playPattern,
      1800
    );
}

if (preview) {
  setTimeout(
    () => stopSound(),
    1200
  );
}


};

const stopSound = () => {
if (
soundIntervalRef.current
) {
clearInterval(
soundIntervalRef.current
);


  soundIntervalRef.current =
    null;
}


};

const requestNotifications =
async () => {
if (
!("Notification" in window)
) {
return;
}


  if (
    Notification.permission ===
    "default"
  ) {
    const permission =
      await Notification.requestPermission();

    setNotificationPermission(
      permission
    );
  }
};


if (!mounted) {
return ( <main className="min-h-screen bg-zinc-950" />
);
}

return ( <main className="page-enter min-h-screen bg-zinc-950 text-white"> <Header />


  <div className="mx-auto min-h-screen max-w-4xl px-5 pb-28 pt-8 sm:px-8 sm:pt-10">

    <div className="flex items-start justify-between gap-4">

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
          Clock
        </p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          Reminders
        </h1>

        <p className="mt-2 max-w-md text-sm text-zinc-500">
          Keep track of the things
          you don't want to forget.
        </p>
      </div>

      <button
        type="button"
        onClick={openNewForm}
        className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
      >
        <span className="mr-1">
          +
        </span>
        Reminder
      </button>

    </div>

    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">

      <StatCard
        label="Total"
        value={reminders.length}
      />

      <StatCard
        label="Upcoming"
        value={upcomingCount}
      />

      <div className="hidden sm:block">
        <StatCard
          label="Completed"
          value={completedCount}
        />
      </div>

    </div>

    {notificationPermission !==
      "granted" && (
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-medium">
            Notifications are not enabled
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Enable them to receive reminder alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={
            requestNotifications
          }
          className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-medium transition hover:bg-zinc-800"
        >
          Enable notifications
        </button>

      </div>
    )}

    <div className="mt-8">

      <div className="relative">

        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          ⌕
        </span>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search reminders..."
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
        />

      </div>

    </div>

    <div className="mt-4 flex gap-2 overflow-x-auto">

      {[
        ["all", "All"],
        ["upcoming", "Upcoming"],
        ["completed", "Completed"],
      ].map(
        ([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setActiveFilter(
                value as FilterType
              )
            }
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition ${
              activeFilter === value
                ? "border-white bg-white text-black"
                : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-white"
            }`}
          >
            {label}
          </button>
        )
      )}

    </div>

    {showForm && (
      <section className="scale-in mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl sm:p-7">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              {editingId
                ? "Edit"
                : "Create"}
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              {editingId
                ? "Edit reminder"
                : "New reminder"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeForm}
            className="rounded-full px-3 py-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
          >
            ✕
          </button>

        </div>

        <div className="mt-6 space-y-5">

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Title
            </label>

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="e.g. Submit PLC report"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Description
              <span className="ml-2 normal-case tracking-normal text-zinc-700">
                optional
              </span>
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={3}
              placeholder="Add some details..."
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Time
              </label>

              <input
                type="time"
                value={time}
                onChange={(event) =>
                  setTime(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-sm outline-none focus:border-zinc-400"
              />
            </div>

          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Repeat
            </label>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">

              {[
                ["once", "Once"],
                ["daily", "Daily"],
                ["weekdays", "Weekdays"],
                ["weekends", "Weekends"],
                ["custom", "Custom"],
              ].map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setRepeat(
                        value as RepeatType
                      )
                    }
                    className={`rounded-xl border px-3 py-3 text-xs font-medium transition ${
                      repeat === value
                        ? "border-white bg-white text-black"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}

            </div>
          </div>

          {repeat ===
            "custom" && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">

              <p className="mb-3 text-xs text-zinc-500">
                Select days
              </p>

              <div className="flex gap-2">

                {DAYS.map(
                  (day) => {
                    const selected =
                      days.includes(
                        day.value
                      );

                    return (
                      <button
                        key={
                          day.value
                        }
                        type="button"
                        onClick={() =>
                          toggleDay(
                            day.value
                          )
                        }
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-medium transition ${
                          selected
                            ? "border-white bg-white text-black"
                            : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white"
                        }`}
                        title={
                          day.label
                        }
                      >
                        {day.short}
                      </button>
                    );
                  }
                )}

              </div>

            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Sound
            </label>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

              {SOUND_OPTIONS.map(
                (option) => (
                  <div
                    key={
                      option.value
                    }
                    className={`flex items-center rounded-xl border transition ${
                      sound ===
                      option.value
                        ? "border-white"
                        : "border-zinc-800"
                    }`}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        setSound(
                          option.value
                        )
                      }
                      className={`flex-1 px-3 py-3 text-left text-xs font-medium ${
                        sound ===
                        option.value
                          ? "text-white"
                          : "text-zinc-500"
                      }`}
                    >
                      {option.label}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        previewSound(
                          option.value
                        )
                      }
                      className="px-3 py-3 text-zinc-600 hover:text-white"
                      title="Preview sound"
                    >
                      ▶
                    </button>

                  </div>
                )
              )}

            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">

            <div>
              <p className="text-sm font-medium">
                Reminder enabled
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                You can disable it without deleting it.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setEnabled(
                  (current) =>
                    !current
                )
              }
              className={`relative h-7 w-12 rounded-full transition ${
                enabled
                  ? "bg-white"
                  : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full transition ${
                  enabled
                    ? "right-1 bg-black"
                    : "left-1 bg-zinc-400"
                }`}
              />
            </button>

          </div>

          <button
            type="button"
            onClick={
              saveReminder
            }
            disabled={
              !title.trim() ||
              !date ||
              !time ||
              (repeat ===
                "custom" &&
                days.length === 0)
            }
            className="w-full rounded-xl bg-white py-4 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {editingId
              ? "Save changes"
              : "Create reminder"}
          </button>

        </div>

      </section>
    )}

    <section className="mt-8">

      {filteredReminders.length ===
      0 ? (
        <EmptyState
          filter={activeFilter}
          search={search}
          onAdd={openNewForm}
        />
      ) : (
        <div className="space-y-3">

          {filteredReminders.map(
            (reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                timeFormat={
                  timeFormat
                }
                onComplete={
                  toggleCompleted
                }
                onToggle={
                  toggleEnabled
                }
                onEdit={
                  openEditForm
                }
                onDelete={
                  deleteReminder
                }
              />
            )
          )}

        </div>
      )}

    </section>

  </div>

  {ringingReminder && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl">

      <div className="scale-in w-full max-w-md rounded-[2rem] border border-zinc-700 bg-zinc-950 p-7 text-center shadow-2xl sm:p-10">

        <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-3xl">
          🔔
        </div>

        <p className="mt-7 text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
          Reminder
        </p>

        <h2 className="mt-3 text-3xl font-semibold">
          {ringingReminder.title}
        </h2>

        {ringingReminder.description && (
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            {ringingReminder.description}
          </p>
        )}

        <div className="mt-8 flex items-center justify-center gap-2">

          {[5, 10, 15].map(
            (minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() =>
                  setSnoozeMinutes(
                    minutes
                  )
                }
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  snoozeMinutes ===
                  minutes
                    ? "border-white bg-white text-black"
                    : "border-zinc-800 text-zinc-500"
                }`}
              >
                {minutes} min
              </button>
            )
          )}

        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={
              snoozeReminder
            }
            className="rounded-xl border border-zinc-700 py-4 text-sm font-medium transition hover:bg-zinc-900"
          >
            Snooze
          </button>

          <button
            type="button"
            onClick={
              stopReminder
            }
            className="rounded-xl bg-white py-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Done
          </button>

        </div>

      </div>

    </div>
  )}

  <BottomNav />
</main>


);
}

function StatCard({
label,
value,
}: {
label: string;
value: number;
}) {
return ( <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"> <p className="text-xs text-zinc-500">
{label} </p>


  <p className="mt-2 text-2xl font-semibold">
    {value}
  </p>
</div>


);
}

function ReminderCard({
reminder,
timeFormat,
onComplete,
onToggle,
onEdit,
onDelete,
}: {
reminder: Reminder;
timeFormat: "12" | "24";
onComplete: (id: string) => void;
onToggle: (id: string) => void;
onEdit: (reminder: Reminder) => void;
onDelete: (id: string) => void;
}) {
const dateObject =
new Date(
`${reminder.date}T${reminder.time}`
);

const timeText =
dateObject.toLocaleTimeString(
"en-IN",
{
hour:
timeFormat === "24"
? "2-digit"
: "numeric",
minute: "2-digit",
hour12:
timeFormat === "12",
}
);

const dateText =
dateObject.toLocaleDateString(
"en-IN",
{
weekday: "short",
day: "numeric",
month: "short",
}
);

return (
<div
className={`group rounded-2xl border p-4 transition ${
        reminder.completed
          ? "border-zinc-900 bg-zinc-950/40 opacity-50"
          : reminder.enabled
          ? "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
          : "border-zinc-900 bg-zinc-950/50 opacity-50"
      }`}
>


  <div className="flex items-start gap-4">

    <button
      type="button"
      onClick={() =>
        onComplete(
          reminder.id
        )
      }
      className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
        reminder.completed
          ? "border-white bg-white text-black"
          : "border-zinc-600 hover:border-white"
      }`}
    >
      {reminder.completed &&
        "✓"}
    </button>

    <div className="min-w-0 flex-1">

      <div className="flex flex-wrap items-center gap-2">

        <h3
          className={`font-medium ${
            reminder.completed
              ? "line-through"
              : ""
          }`}
        >
          {reminder.title}
        </h3>

        {!reminder.enabled &&
          !reminder.completed && (
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
              Disabled
            </span>
          )}

      </div>

      {reminder.description && (
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
          {reminder.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">

        <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
          {dateText}
        </span>

        <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
          {timeText}
        </span>

        <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-500">
          {getRepeatLabel(
            reminder
          )}
        </span>

      </div>

    </div>

    <div className="flex items-center gap-1">

      <button
        type="button"
        onClick={() =>
          onToggle(
            reminder.id
          )
        }
        className={`rounded-lg px-2 py-2 text-xs transition ${
          reminder.enabled
            ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            : "text-zinc-600 hover:bg-zinc-800 hover:text-white"
        }`}
        title={
          reminder.enabled
            ? "Disable"
            : "Enable"
        }
      >
        {reminder.enabled
          ? "●"
          : "○"}
      </button>

      <button
        type="button"
        onClick={() =>
          onEdit(reminder)
        }
        className="rounded-lg px-2 py-2 text-xs text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
        title="Edit"
      >
        ✎
      </button>

      <button
        type="button"
        onClick={() =>
          onDelete(
            reminder.id
          )
        }
        className="rounded-lg px-2 py-2 text-xs text-zinc-600 transition hover:bg-zinc-800 hover:text-white"
        title="Delete"
      >
        ×
      </button>

    </div>

  </div>

</div>


);
}

function EmptyState({
filter,
search,
onAdd,
}: {
filter: FilterType;
search: string;
onAdd: () => void;
}) {
let title =
"No reminders yet";

let description =
"Create your first reminder to keep track of important tasks.";

if (search) {
title =
"No matching reminders";


description =
  "Try a different search term.";


} else if (
filter === "upcoming"
) {
title =
"Nothing upcoming";


description =
  "You don't have any active upcoming reminders.";


} else if (
filter === "completed"
) {
title =
"Nothing completed";


description =
  "Completed reminders will appear here.";


}

return ( <div className="rounded-3xl border border-dashed border-zinc-800 px-6 py-16 text-center">


  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-xl">
    ✓
  </div>

  <h2 className="mt-5 font-medium">
    {title}
  </h2>

  <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
    {description}
  </p>

  {!search &&
    filter === "all" && (
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
      >
        Create reminder
      </button>
    )}

</div>


);
}

function normalizeReminder(
reminder: Partial<Reminder>
): Reminder {
return {
id:
reminder.id ||
Date.now().toString(),


title:
  reminder.title || "",

description:
  reminder.description || "",

date:
  reminder.date ||
  formatDateInput(
    new Date()
  ),

time:
  reminder.time ||
  "12:00",

repeat:
  reminder.repeat ||
  "once",

days:
  Array.isArray(
    reminder.days
  )
    ? reminder.days
    : [],

sound:
  reminder.sound ||
  "classic",

enabled:
  reminder.enabled ??
  true,

completed:
  reminder.completed ??
  false,

createdAt:
  reminder.createdAt ||
  Date.now(),

lastTriggered:
  reminder.lastTriggered,


};
}

function createId() {
if (
typeof crypto !==
"undefined" &&
typeof crypto.randomUUID ===
"function"
) {
return crypto.randomUUID();
}

return Date.now().toString();
}

function formatDateInput(
date: Date
) {
return (
`${date.getFullYear()}-` +
`${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-` +
`${String(
      date.getDate()
    ).padStart(2, "0")}`
);
}

function shouldTriggerReminder(
reminder: Reminder,
now: Date
) {
const [hour, minute] =
reminder.time
.split(":")
.map(Number);

if (
now.getHours() !== hour ||
now.getMinutes() !== minute ||
now.getSeconds() > 2
) {
return false;
}

if (
reminder.repeat ===
"once"
) {
const target =
new Date(
`${reminder.date}T${reminder.time}`
);


return (
  now.getFullYear() ===
    target.getFullYear() &&
  now.getMonth() ===
    target.getMonth() &&
  now.getDate() ===
    target.getDate()
);


}

const day =
now.getDay();

if (
reminder.repeat ===
"daily"
) {
return true;
}

if (
reminder.repeat ===
"weekdays"
) {
return (
day >= 1 &&
day <= 5
);
}

if (
reminder.repeat ===
"weekends"
) {
return (
day === 0 ||
day === 6
);
}

if (
reminder.repeat ===
"custom"
) {
return reminder.days.includes(
day
);
}

return false;
}

function getOccurrenceKey(
reminder: Reminder,
date: Date
) {
const day =
`${date.getFullYear()}-` +
`${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-` +
`${String(
      date.getDate()
    ).padStart(2, "0")}`;

return `${reminder.id}-${day}`;
}

function getNextOccurrence(
reminder: Reminder
) {
if (
reminder.completed
) {
return Number.MAX_SAFE_INTEGER;
}

const now = new Date();

const [hour, minute] =
reminder.time
.split(":")
.map(Number);

if (
reminder.repeat ===
"once"
) {
return new Date(
`${reminder.date}T${reminder.time}`
).getTime();
}

for (
let offset = 0;
offset < 8;
offset++
) {
const candidate =
new Date(now);


candidate.setDate(
  now.getDate() +
    offset
);

candidate.setHours(
  hour,
  minute,
  0,
  0
);

const day =
  candidate.getDay();

let matches =
  false;

if (
  reminder.repeat ===
  "daily"
) {
  matches = true;
}

if (
  reminder.repeat ===
  "weekdays"
) {
  matches =
    day >= 1 &&
    day <= 5;
}

if (
  reminder.repeat ===
  "weekends"
) {
  matches =
    day === 0 ||
    day === 6;
}

if (
  reminder.repeat ===
  "custom"
) {
  matches =
    reminder.days.includes(
      day
    );
}

if (
  matches &&
  candidate.getTime() >=
    now.getTime()
) {
  return candidate.getTime();
}


}

return Number.MAX_SAFE_INTEGER;
}

function getRepeatLabel(
reminder: Reminder
) {
if (
reminder.repeat ===
"once"
) {
return "Once";
}

if (
reminder.repeat ===
"daily"
) {
return "Every day";
}

if (
reminder.repeat ===
"weekdays"
) {
return "Weekdays";
}

if (
reminder.repeat ===
"weekends"
) {
return "Weekends";
}

return [...reminder.days]
.sort()
.map(
(day) =>
DAYS.find(
(item) =>
item.value ===
day
)?.label
)
.join(" · ");
}

function vibrate() {
if (
"vibrate" in navigator
) {
navigator.vibrate([
300,
150,
300,
150,
600,
]);
}
}

function sendNotification(
reminder: Reminder
) {
if (
"Notification" in window &&
Notification.permission ===
"granted"
) {
try {
new Notification(
"Clock Reminder",
{
body:
reminder.description
? `${reminder.title}\n${reminder.description}`
: reminder.title,
icon: "/favicon.ico",
}
);
} catch {
// Browser notification failed.
}
}
}
