import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
return {
name: "Clock",
short_name: "Clock",
description: "A modern clock, alarm, timer, stopwatch and reminder app.",
start_url: "/",
display: "standalone",
background_color: "#09090b",
theme_color: "#09090b",
orientation: "portrait",
};
}
