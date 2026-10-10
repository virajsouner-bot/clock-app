"use client";

import { useEffect, useState } from "react";

export default function InstallApp() {
const [installPrompt, setInstallPrompt] =
useState<BeforeInstallPromptEvent | null>(null);

const [isInstalled, setIsInstalled] =
useState(false);

useEffect(() => {
const handleBeforeInstallPrompt = (
event: Event
) => {
event.preventDefault();


  setInstallPrompt(
    event as BeforeInstallPromptEvent
  );
};

const checkInstalled = () => {
  const standalone =
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

  const iosStandalone =
    (window.navigator as Navigator & {
      standalone?: boolean;
    }).standalone === true;

  setIsInstalled(
    standalone || iosStandalone
  );
};

window.addEventListener(
  "beforeinstallprompt",
  handleBeforeInstallPrompt
);

window.addEventListener(
  "appinstalled",
  () => {
    setInstallPrompt(null);
    setIsInstalled(true);
  }
);

checkInstalled();

return () => {
  window.removeEventListener(
    "beforeinstallprompt",
    handleBeforeInstallPrompt
  );
};


}, []);

const handleInstall = async () => {
if (!installPrompt) return;


await installPrompt.prompt();

const result =
  await installPrompt.userChoice;

if (result.outcome === "accepted") {
  setInstallPrompt(null);
  setIsInstalled(true);
}


};

if (isInstalled || !installPrompt) {
return null;
}

return ( <button
   type="button"
   onClick={handleInstall}
   className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-800"
 >
Install App </button>
);
}

interface BeforeInstallPromptEvent
extends Event {
prompt(): Promise<void>;
userChoice: Promise<{
outcome: "accepted" | "dismissed";
platform: string;
}>;
}
