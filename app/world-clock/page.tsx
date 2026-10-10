
"use client";

import { useEffect, useMemo, useState } from "react";

type City = {
  id: string;
  name: string;
  country: string;
  timezone: string;
};

const availableCities: City[] = [
  // NORTH AMERICA
  {
    id: "new-york",
    name: "New York",
    country: "USA",
    timezone: "America/New_York",
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    country: "USA",
    timezone: "America/Los_Angeles",
  },
  {
    id: "chicago",
    name: "Chicago",
    country: "USA",
    timezone: "America/Chicago",
  },
  {
    id: "denver",
    name: "Denver",
    country: "USA",
    timezone: "America/Denver",
  },
  {
    id: "san-francisco",
    name: "San Francisco",
    country: "USA",
    timezone: "America/Los_Angeles",
  },
  {
    id: "las-vegas",
    name: "Las Vegas",
    country: "USA",
    timezone: "America/Los_Angeles",
  },
  {
    id: "houston",
    name: "Houston",
    country: "USA",
    timezone: "America/Chicago",
  },
  {
    id: "miami",
    name: "Miami",
    country: "USA",
    timezone: "America/New_York",
  },
  {
    id: "toronto",
    name: "Toronto",
    country: "Canada",
    timezone: "America/Toronto",
  },
  {
    id: "vancouver",
    name: "Vancouver",
    country: "Canada",
    timezone: "America/Vancouver",
  },
  {
    id: "montreal",
    name: "Montreal",
    country: "Canada",
    timezone: "America/Toronto",
  },

  // SOUTH AMERICA
  {
    id: "sao-paulo",
    name: "São Paulo",
    country: "Brazil",
    timezone: "America/Sao_Paulo",
  },
  {
    id: "rio-de-janeiro",
    name: "Rio de Janeiro",
    country: "Brazil",
    timezone: "America/Sao_Paulo",
  },
  {
    id: "buenos-aires",
    name: "Buenos Aires",
    country: "Argentina",
    timezone: "America/Argentina/Buenos_Aires",
  },
  {
    id: "santiago",
    name: "Santiago",
    country: "Chile",
    timezone: "America/Santiago",
  },
  {
    id: "lima",
    name: "Lima",
    country: "Peru",
    timezone: "America/Lima",
  },

  // EUROPE
  {
    id: "london",
    name: "London",
    country: "UK",
    timezone: "Europe/London",
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    timezone: "Europe/Paris",
  },
  {
    id: "berlin",
    name: "Berlin",
    country: "Germany",
    timezone: "Europe/Berlin",
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    timezone: "Europe/Rome",
  },
  {
    id: "madrid",
    name: "Madrid",
    country: "Spain",
    timezone: "Europe/Madrid",
  },
  {
    id: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    timezone: "Europe/Amsterdam",
  },
  {
    id: "brussels",
    name: "Brussels",
    country: "Belgium",
    timezone: "Europe/Brussels",
  },
  {
    id: "vienna",
    name: "Vienna",
    country: "Austria",
    timezone: "Europe/Vienna",
  },
  {
    id: "zurich",
    name: "Zurich",
    country: "Switzerland",
    timezone: "Europe/Zurich",
  },
  {
    id: "stockholm",
    name: "Stockholm",
    country: "Sweden",
    timezone: "Europe/Stockholm",
  },
  {
    id: "oslo",
    name: "Oslo",
    country: "Norway",
    timezone: "Europe/Oslo",
  },
  {
    id: "copenhagen",
    name: "Copenhagen",
    country: "Denmark",
    timezone: "Europe/Copenhagen",
  },
  {
    id: "helsinki",
    name: "Helsinki",
    country: "Finland",
    timezone: "Europe/Helsinki",
  },
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    timezone: "Europe/Lisbon",
  },
  {
    id: "athens",
    name: "Athens",
    country: "Greece",
    timezone: "Europe/Athens",
  },
  {
    id: "istanbul",
    name: "Istanbul",
    country: "Turkey",
    timezone: "Europe/Istanbul",
  },
  {
    id: "moscow",
    name: "Moscow",
    country: "Russia",
    timezone: "Europe/Moscow",
  },
  {
    id: "kyiv",
    name: "Kyiv",
    country: "Ukraine",
    timezone: "Europe/Kyiv",
  },

  // MIDDLE EAST
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    timezone: "Asia/Dubai",
  },
  {
    id: "abu-dhabi",
    name: "Abu Dhabi",
    country: "UAE",
    timezone: "Asia/Dubai",
  },
  {
    id: "doha",
    name: "Doha",
    country: "Qatar",
    timezone: "Asia/Qatar",
  },
  {
    id: "riyadh",
    name: "Riyadh",
    country: "Saudi Arabia",
    timezone: "Asia/Riyadh",
  },
  {
    id: "kuwait-city",
    name: "Kuwait City",
    country: "Kuwait",
    timezone: "Asia/Kuwait",
  },
  {
    id: "tehran",
    name: "Tehran",
    country: "Iran",
    timezone: "Asia/Tehran",
  },
  {
    id: "jerusalem",
    name: "Jerusalem",
    country: "Israel",
    timezone: "Asia/Jerusalem",
  },

  // ASIA
  {
    id: "new-delhi",
    name: "New Delhi",
    country: "India",
    timezone: "Asia/Kolkata",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    country: "India",
    timezone: "Asia/Kolkata",
  },
  {
    id: "kolkata",
    name: "Kolkata",
    country: "India",
    timezone: "Asia/Kolkata",
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    country: "India",
    timezone: "Asia/Kolkata",
  },
  {
    id: "karachi",
    name: "Karachi",
    country: "Pakistan",
    timezone: "Asia/Karachi",
  },
  {
    id: "dhaka",
    name: "Dhaka",
    country: "Bangladesh",
    timezone: "Asia/Dhaka",
  },
  {
    id: "kathmandu",
    name: "Kathmandu",
    country: "Nepal",
    timezone: "Asia/Kathmandu",
  },
  {
    id: "colombo",
    name: "Colombo",
    country: "Sri Lanka",
    timezone: "Asia/Colombo",
  },
  {
    id: "yangon",
    name: "Yangon",
    country: "Myanmar",
    timezone: "Asia/Yangon",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    timezone: "Asia/Bangkok",
  },
  {
    id: "jakarta",
    name: "Jakarta",
    country: "Indonesia",
    timezone: "Asia/Jakarta",
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    timezone: "Asia/Singapore",
  },
  {
    id: "kuala-lumpur",
    name: "Kuala Lumpur",
    country: "Malaysia",
    timezone: "Asia/Kuala_Lumpur",
  },
  {
    id: "hong-kong",
    name: "Hong Kong",
    country: "Hong Kong",
    timezone: "Asia/Hong_Kong",
  },
  {
    id: "beijing",
    name: "Beijing",
    country: "China",
    timezone: "Asia/Shanghai",
  },
  {
    id: "shanghai",
    name: "Shanghai",
    country: "China",
    timezone: "Asia/Shanghai",
  },
  {
    id: "seoul",
    name: "Seoul",
    country: "South Korea",
    timezone: "Asia/Seoul",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo",
  },
  {
    id: "osaka",
    name: "Osaka",
    country: "Japan",
    timezone: "Asia/Tokyo",
  },
  {
    id: "manila",
    name: "Manila",
    country: "Philippines",
    timezone: "Asia/Manila",
  },
  {
    id: "taipei",
    name: "Taipei",
    country: "Taiwan",
    timezone: "Asia/Taipei",
  },

  // OCEANIA
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    timezone: "Australia/Sydney",
  },
  {
    id: "melbourne",
    name: "Melbourne",
    country: "Australia",
    timezone: "Australia/Melbourne",
  },
  {
    id: "brisbane",
    name: "Brisbane",
    country: "Australia",
    timezone: "Australia/Brisbane",
  },
  {
    id: "perth",
    name: "Perth",
    country: "Australia",
    timezone: "Australia/Perth",
  },
  {
    id: "auckland",
    name: "Auckland",
    country: "New Zealand",
    timezone: "Pacific/Auckland",
  },

  // AFRICA
  {
    id: "cairo",
    name: "Cairo",
    country: "Egypt",
    timezone: "Africa/Cairo",
  },
  {
    id: "johannesburg",
    name: "Johannesburg",
    country: "South Africa",
    timezone: "Africa/Johannesburg",
  },
  {
    id: "cape-town",
    name: "Cape Town",
    country: "South Africa",
    timezone: "Africa/Johannesburg",
  },
  {
    id: "nairobi",
    name: "Nairobi",
    country: "Kenya",
    timezone: "Africa/Nairobi",
  },
  {
    id: "lagos",
    name: "Lagos",
    country: "Nigeria",
    timezone: "Africa/Lagos",
  },
  {
    id: "casablanca",
    name: "Casablanca",
    country: "Morocco",
    timezone: "Africa/Casablanca",
  },
];

export default function WorldClockPage() {
  const [currentTime, setCurrentTime] =
    useState<Date | null>(null);

  const [selectedCities, setSelectedCities] =
    useState<City[]>([]);

  const [favorites, setFavorites] =
    useState<string[]>([]);

  const [showAddCity, setShowAddCity] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [timeFormat, setTimeFormat] =
    useState<"12" | "24">("12");

  // ----------------------------------------
  // LOAD SAVED DATA
  // ----------------------------------------

  useEffect(() => {
    const savedCities =
      localStorage.getItem(
        "worldClockCities"
      );

    const savedFavorites =
      localStorage.getItem(
        "worldClockFavorites"
      );

    const savedTimeFormat =
      localStorage.getItem(
        "timeFormat"
      );

    // Load cities
    if (savedCities) {
      try {
        const savedIds: string[] =
          JSON.parse(savedCities);

        const cities =
          availableCities.filter(
            (city) =>
              savedIds.includes(city.id)
          );

        setSelectedCities(cities);
      } catch {
        setSelectedCities([]);
      }
    } else {
      const defaultCities =
        availableCities.filter(
          (city) =>
            city.id === "new-delhi" ||
            city.id === "london" ||
            city.id === "dubai" ||
            city.id === "tokyo"
        );

      setSelectedCities(
        defaultCities
      );
    }

    // Load favorites
    if (savedFavorites) {
      try {
        setFavorites(
          JSON.parse(savedFavorites)
        );
      } catch {
        setFavorites([]);
      }
    }

    // Load time format
    if (
      savedTimeFormat === "12" ||
      savedTimeFormat === "24"
    ) {
      setTimeFormat(
        savedTimeFormat
      );
    }
  }, []);

  // ----------------------------------------
  // WATCH SETTINGS
  // ----------------------------------------

  useEffect(() => {
    const updateSettings = () => {
      const saved =
        localStorage.getItem(
          "timeFormat"
        );

      if (
        saved === "12" ||
        saved === "24"
      ) {
        setTimeFormat(saved);
      }
    };

    updateSettings();

    const interval =
      setInterval(
        updateSettings,
        500
      );

    window.addEventListener(
      "storage",
      updateSettings
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "storage",
        updateSettings
      );
    };
  }, []);

  // ----------------------------------------
  // SAVE CITIES
  // ----------------------------------------

  useEffect(() => {
    localStorage.setItem(
      "worldClockCities",
      JSON.stringify(
        selectedCities.map(
          (city) => city.id
        )
      )
    );
  }, [selectedCities]);

  // ----------------------------------------
  // SAVE FAVORITES
  // ----------------------------------------

  useEffect(() => {
    localStorage.setItem(
      "worldClockFavorites",
      JSON.stringify(
        favorites
      )
    );
  }, [favorites]);

  // ----------------------------------------
  // LIVE CLOCK
  // ----------------------------------------

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date()
      );
    };

    updateTime();

    const interval =
      setInterval(
        updateTime,
        1000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  // ----------------------------------------
  // ADD CITY
  // ----------------------------------------

  const addCity = (
    city: City
  ) => {
    const exists =
      selectedCities.some(
        (item) =>
          item.id === city.id
      );

    if (exists) {
      return;
    }

    setSelectedCities(
      (previous) => [
        ...previous,
        city,
      ]
    );

    setShowAddCity(false);
    setSearch("");
  };

  // ----------------------------------------
  // REMOVE CITY
  // ----------------------------------------

  const removeCity = (
    cityId: string
  ) => {
    setSelectedCities(
      (previous) =>
        previous.filter(
          (city) =>
            city.id !== cityId
        )
    );

    setFavorites(
      (previous) =>
        previous.filter(
          (id) =>
            id !== cityId
        )
    );
  };

  // ----------------------------------------
  // TOGGLE FAVORITE
  // ----------------------------------------

  const toggleFavorite = (
    cityId: string
  ) => {
    setFavorites(
      (previous) => {
        if (
          previous.includes(
            cityId
          )
        ) {
          return previous.filter(
            (id) =>
              id !== cityId
          );
        }

        return [
          ...previous,
          cityId,
        ];
      }
    );
  };

  // ----------------------------------------
  // FORMAT TIME
  // ----------------------------------------

  const formatTime = (
    date: Date,
    timezone: string
  ) => {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12:
          timeFormat === "12",
      }
    ).format(date);
  };

  // ----------------------------------------
  // FORMAT DATE
  // ----------------------------------------

  const formatDate = (
    date: Date,
    timezone: string
  ) => {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone: timezone,
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(date);
  };

  // ----------------------------------------
  // UTC OFFSET
  // ----------------------------------------

  const getTimezoneOffset = (
    date: Date,
    timezone: string
  ) => {
    const parts =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: timezone,
          timeZoneName: "longOffset",
        }
      ).formatToParts(date);

    const offset =
      parts.find(
        (part) =>
          part.type ===
          "timeZoneName"
      )?.value;

    if (!offset) {
      return "";
    }

    return offset.replace(
      "GMT",
      "UTC"
    );
  };

  // ----------------------------------------
  // SEARCH CITIES
  // ----------------------------------------

  const citiesNotAdded =
    availableCities.filter(
      (city) =>
        !selectedCities.some(
          (selected) =>
            selected.id ===
            city.id
        )
    );

  const filteredCities =
    citiesNotAdded.filter(
      (city) => {
        const searchText =
          search
            .trim()
            .toLowerCase();

        if (!searchText) {
          return true;
        }

        return (
          city.name
            .toLowerCase()
            .includes(searchText) ||
          city.country
            .toLowerCase()
            .includes(searchText)
        );
      }
    );

  // ----------------------------------------
  // SORT CITIES
  // ----------------------------------------

  const sortedCities =
    useMemo(() => {
      return [...selectedCities].sort(
        (a, b) => {
          const aFavorite =
            favorites.includes(
              a.id
            );

          const bFavorite =
            favorites.includes(
              b.id
            );

          if (
            aFavorite &&
            !bFavorite
          ) {
            return -1;
          }

          if (
            !aFavorite &&
            bFavorite
          ) {
            return 1;
          }

          return 0;
        }
      );
    }, [
      selectedCities,
      favorites,
    ]);

  // ----------------------------------------
  // LOADING
  // ----------------------------------------

  if (!currentTime) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">

        <div className="mx-auto max-w-xl px-6 pt-10">

          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
            Clock
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            World Clock
          </h1>

          <div className="mt-10 h-32 animate-pulse rounded-2xl bg-zinc-900" />

        </div>

      </main>
    );
  }

  // ----------------------------------------
  // MAIN UI
  // ----------------------------------------

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      <div className="mx-auto min-h-screen max-w-xl px-6 pb-24 pt-10">

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Clock
            </p>

            <h1 className="mt-2 text-4xl font-semibold">
              World Clock
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Track time around the world.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowAddCity(true)
            }
            className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            + Add
          </button>

        </div>

        {/* FORMAT INFORMATION */}

        <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">

          <div>

            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Display format
            </p>

            <p className="mt-1 text-sm font-medium">
              {timeFormat === "12"
                ? "12-hour"
                : "24-hour"}
            </p>

          </div>

          <p className="text-xs text-zinc-600">
            Change in Settings
          </p>

        </div>

        {/* CITY LIST */}

        <div className="mt-6 space-y-3">

          {sortedCities.length ===
            0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">

              <div className="text-4xl">
                🌍
              </div>

              <h2 className="mt-4 font-medium">
                No cities added
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Add a city to start
                tracking world time.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowAddCity(true)
                }
                className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-medium text-black"
              >
                Add a city
              </button>

            </div>
          )}

          {sortedCities.map(
            (city) => {

              const isFavorite =
                favorites.includes(
                  city.id
                );

              const isLocal =
                city.id ===
                "new-delhi";

              return (
                <div
                  key={city.id}
                  className={`rounded-2xl border p-5 ${
                    isLocal
                      ? "border-zinc-600 bg-zinc-900"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >

                  {/* CARD TOP */}

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-lg font-medium">
                          {city.name}
                        </h2>

                        {isLocal && (
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-black">
                            Local
                          </span>
                        )}

                        {isFavorite && (
                          <span className="text-sm">
                            ⭐
                          </span>
                        )}

                      </div>

                      <p className="mt-1 text-sm text-zinc-500">
                        {city.country}
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite(
                            city.id
                          )
                        }
                        className="text-2xl leading-none transition hover:scale-110"
                        aria-label={
                          isFavorite
                            ? "Remove favorite"
                            : "Add favorite"
                        }
                      >
                        {isFavorite
                          ? "★"
                          : "☆"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeCity(
                            city.id
                          )
                        }
                        className="text-sm text-zinc-600 transition hover:text-red-400"
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                  {/* TIME */}

                  <div className="mt-6">

                    <div className="text-4xl font-semibold tracking-tight sm:text-5xl">
                      {formatTime(
                        currentTime,
                        city.timezone
                      )}
                    </div>

                    <p className="mt-3 text-sm text-zinc-500">
                      {formatDate(
                        currentTime,
                        city.timezone
                      )}
                    </p>

                    <div className="mt-2 flex items-center justify-between">

                      <p className="text-xs text-zinc-600">
                        {getTimezoneOffset(
                          currentTime,
                          city.timezone
                        )}
                      </p>

                      {isLocal && (
                        <p className="text-xs text-zinc-600">
                          Your local time
                        </p>
                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* ADD CITY MODAL */}

        {showAddCity && (
          <div
            className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-4 sm:items-center"
            onClick={() => {
              setShowAddCity(false);
              setSearch("");
            }}
          >

            <div
              className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* MODAL HEADER */}

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-zinc-500">
                    World Clock
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold">
                    Add a city
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddCity(false);
                    setSearch("");
                  }}
                  className="text-2xl text-zinc-500 transition hover:text-white"
                >
                  ×
                </button>

              </div>

              {/* SEARCH */}

              <div className="mt-6">

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    🔎
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search city or country..."
                    autoFocus
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-11 pr-4 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-400"
                  />

                </div>

                <p className="mt-2 text-xs text-zinc-600">
                  {filteredCities.length} cities available
                </p>

              </div>

              {/* RESULTS */}

              <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">

                {filteredCities.map(
                  (city) => (

                    <button
                      key={city.id}
                      type="button"
                      onClick={() =>
                        addCity(
                          city
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:bg-zinc-800"
                    >

                      <div>

                        <div className="font-medium">
                          {city.name}
                        </div>

                        <div className="mt-1 text-sm text-zinc-500">
                          {city.country}
                        </div>

                      </div>

                      <span className="text-lg text-zinc-500">
                        +
                      </span>

                    </button>

                  )
                )}

                {filteredCities.length ===
                  0 && (
                  <div className="py-8 text-center">

                    <div className="text-3xl">
                      🌍
                    </div>

                    <p className="mt-3 text-sm text-zinc-500">
                      No cities found.
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Try another city or country.
                    </p>

                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}

