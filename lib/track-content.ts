import aiLead from "@/content/tracks/ai-lead.json";
import pmAi from "@/content/tracks/pm-ai.json";

// Each track's course content lives in content/tracks/<id>.json. To add a track, add the
// JSON file, import it here, and register the track in lib/tracks.ts. Strings marked
// "html" hold our own trusted markup (links and emphasis) and are rendered as HTML.
export type TrackContent = typeof aiLead;

const CONTENT: Record<string, TrackContent> = {
  "ai-lead": aiLead,
  "pm-ai": pmAi as unknown as TrackContent,
};

export function getContent(id: string): TrackContent | undefined {
  return CONTENT[id];
}
