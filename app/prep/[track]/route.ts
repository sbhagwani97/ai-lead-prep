import { readFileSync } from "node:fs";
import path from "node:path";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { loadProfile, setLastTrack } from "@/lib/progress";
import { TRACKS, getTrack } from "@/lib/tracks";

export const dynamic = "force-dynamic";

const templates = new Map<string, string>();
function template(file: string) {
  let t = templates.get(file);
  if (!t) {
    t = readFileSync(path.join(process.cwd(), "content", file), "utf8");
    templates.set(file, t);
  }
  return t;
}

export async function GET(req: Request, ctx: { params: Promise<{ track: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));

  const { track: trackId } = await ctx.params;
  const track = getTrack(trackId);
  const [profile, user] = await Promise.all([loadProfile(userId), currentUser()]);

  // Unknown track, or one the user has not joined: back to the picker.
  if (!track || !profile.tracks.includes(track.id)) {
    return NextResponse.redirect(new URL("/tracks", req.url));
  }
  if (profile.last !== track.id) await setLastTrack(userId, track.id);

  const name =
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress ||
    user?.username ||
    "you";

  const boot = {
    name,
    track: { id: track.id, title: track.title },
    tracks: TRACKS.filter((t) => profile.tracks.includes(t.id)).map((t) => ({
      id: t.id,
      title: t.title,
    })),
    ticks: profile.progress[track.id] ?? [],
  };
  // Escape "<" so user-controlled text can never close the script tag.
  const json = JSON.stringify(boot).replace(/</g, "\\u003c");
  const html = template(track.file).replace(
    "<!--PREP_BOOT-->",
    `<script>window.__PREP__=${json};</script>`
  );

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
    },
  });
}
