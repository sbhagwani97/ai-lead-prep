import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { pickGreeting } from "@/lib/greetings";
import { loadProfile, setLastTrack } from "@/lib/progress";
import { getContent } from "@/lib/track-content";
import { TRACKS, getTrack } from "@/lib/tracks";
import CourseView from "./CourseView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preppy", robots: { index: false, follow: false } };

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { track: trackId } = await params;
  const track = getTrack(trackId);
  const content = track ? getContent(track.id) : undefined;
  const [profile, user] = await Promise.all([loadProfile(userId), currentUser()]);

  // Unknown track, or one the user has not joined: back to the picker.
  if (!track || !content || !profile.tracks.includes(track.id)) redirect("/tracks");
  // "Returning" means they had opened a track before this visit.
  const greeting = pickGreeting(user?.firstName, profile.last !== null);
  if (profile.last !== track.id) await setLastTrack(userId, track.id);

  return (
    <CourseView
      content={content}
      greeting={greeting}
      trackId={track.id}
      trackTitle={track.title}
      joined={TRACKS.filter((t) => profile.tracks.includes(t.id)).map((t) => ({ id: t.id, title: t.title }))}
      initialTicks={profile.progress[track.id] ?? []}
    />
  );
}
