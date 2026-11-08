// The single place that defines which tracks exist. To add a track:
//   1. add an entry here
//   2. drop its page template at content/<file>
// Nothing else needs to change. Keep ids stable: they are stored on user accounts.
// This file must stay free of Node imports: the client-side picker imports it too.

export type Track = {
  id: string;
  title: string;
  blurb: string;
  meta: string;
  file: string; // template under /content
};

export const TRACKS: Track[] = [
  {
    id: "ai-lead",
    title: "AI Lead",
    blurb: "Concepts and tools that AI lead and manager job descriptions ask for, with a 6-week plan.",
    meta: "6 weeks · 150 hours",
    file: "ai-lead.html",
  },
  {
    id: "pm-ai",
    title: "Product Manager - AI",
    blurb: "AI product sense, evals, UX and trust, economics and strategy, with a 6-week plan and a PRD project.",
    meta: "6 weeks · 150 hours",
    file: "pm-ai.html",
  },
];

export const TRACK_IDS = TRACKS.map((t) => t.id);

export function getTrack(id: string | null | undefined): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}

export function isTrackId(id: unknown): id is string {
  return typeof id === "string" && TRACK_IDS.includes(id);
}
