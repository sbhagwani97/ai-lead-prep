import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { loadProfile } from "@/lib/progress";
import { TRACKS } from "@/lib/tracks";
import TracksView from "./TracksView";

export const dynamic = "force-dynamic";

export default async function TracksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await loadProfile(userId);
  return <TracksView tracks={TRACKS} joined={profile.tracks} />;
}
