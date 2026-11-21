import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { loadProfile } from "@/lib/progress";
import { getContent } from "@/lib/track-content";
import { TRACKS } from "@/lib/tracks";
import TracksView from "./TracksView";

export const dynamic = "force-dynamic";

export default async function TracksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await loadProfile(userId);
  // Week titles, so each card can show what is inside before you pick it.
  const previews = Object.fromEntries(TRACKS.map((t) => [t.id, getContent(t.id)?.weeks.map((w) => w.t) ?? []]));
  return <TracksView tracks={TRACKS} joined={profile.tracks} previews={previews} />;
}
