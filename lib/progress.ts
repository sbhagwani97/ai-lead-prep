import { auth, clerkClient } from "@clerk/nextjs/server";
import { isTrackId } from "./tracks";

// Stored on the Clerk user:
//   publicMetadata.tracks     string[]  tracks the user joined
//   publicMetadata.lastTrack  string    track opened last (where /prep sends them)
//   privateMetadata.progress  { [trackId]: string[] }  ticked task ids per track
// Legacy (single track) accounts had privateMetadata.ticks: string[]. That is migrated
// into progress["ai-lead"] the first time the profile is loaded.

// Task ids look like w3t5 (week 3, task 5). Anything else is rejected.
const ID_RE = /^w[1-9]\d?t\d{1,2}$/;
export const MAX_TICKS = 200;

export function cleanTicks(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out = new Set<string>();
  for (const v of input) {
    if (typeof v === "string" && ID_RE.test(v)) out.add(v);
    if (out.size >= MAX_TICKS) break;
  }
  return [...out].sort();
}

export function cleanTrackList(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter(isTrackId))];
}

export type Profile = {
  tracks: string[];
  last: string | null;
  progress: Record<string, string[]>;
};

function parse(user: { publicMetadata: unknown; privateMetadata: unknown }) {
  const pub = (user.publicMetadata ?? {}) as { tracks?: unknown; lastTrack?: unknown };
  const priv = (user.privateMetadata ?? {}) as { ticks?: unknown; progress?: unknown };

  const progress: Record<string, string[]> = {};
  if (priv.progress && typeof priv.progress === "object" && !Array.isArray(priv.progress)) {
    for (const [id, v] of Object.entries(priv.progress)) {
      if (isTrackId(id)) progress[id] = cleanTicks(v);
    }
  }
  const legacy = Array.isArray(priv.ticks) ? cleanTicks(priv.ticks) : null;
  if (legacy && !progress["ai-lead"]) progress["ai-lead"] = legacy;

  let tracks = cleanTrackList(pub.tracks);
  const needsMigration = legacy !== null;
  if (needsMigration && !tracks.includes("ai-lead")) tracks = ["ai-lead", ...tracks];

  const last = isTrackId(pub.lastTrack) && tracks.includes(pub.lastTrack) ? pub.lastTrack : null;
  return { profile: { tracks, last, progress } as Profile, needsMigration };
}

export async function loadProfile(userId: string): Promise<Profile> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const { profile, needsMigration } = parse(user);
  if (needsMigration) {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { tracks: profile.tracks },
      privateMetadata: { ticks: null, progress: profile.progress },
    });
  }
  return profile;
}

export async function saveTicks(userId: string, track: string, ticks: string[]) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const { profile } = parse(user);
  if (!profile.tracks.includes(track)) return false;
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { ticks: null, progress: { ...profile.progress, [track]: ticks } },
  });
  return true;
}

export async function setTracks(userId: string, wanted: string[]) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const { profile } = parse(user);
  const tracks = cleanTrackList(wanted);
  if (tracks.length === 0) return null;
  const added = tracks.filter((t) => !profile.tracks.includes(t));
  const active =
    added[0] ?? (profile.last && tracks.includes(profile.last) ? profile.last : tracks[0]);
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { tracks, lastTrack: active },
    privateMetadata: { ticks: null, progress: profile.progress },
  });
  return { tracks, active };
}

export async function setLastTrack(userId: string, track: string) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, { publicMetadata: { lastTrack: track } });
}

export { auth };
