import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { loadProfile } from "@/lib/progress";
import { TRACKS } from "@/lib/tracks";
import TrackPicker from "./TrackPicker";

export const dynamic = "force-dynamic";

export default async function TracksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await loadProfile(userId);
  const first = profile.tracks.length === 0;

  return (
    <main className="center">
      <h1>{first ? "Pick your track" : "Your tracks"}</h1>
      <p>
        {first
          ? "Choose what you want to prepare for. You can follow more than one and switch any time."
          : "Add or remove tracks. Removing one keeps your progress if you add it back later."}
      </p>
      <TrackPicker tracks={TRACKS} joined={profile.tracks} first={first} />
    </main>
  );
}
