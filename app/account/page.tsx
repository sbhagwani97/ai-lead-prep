import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { loadProfile } from "@/lib/progress";
import { getContent } from "@/lib/track-content";
import { TRACKS } from "@/lib/tracks";
import AccountView from "./AccountView";

export const dynamic = "force-dynamic";

export default async function Account() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, profile] = await Promise.all([currentUser(), loadProfile(userId)]);
  const name = user?.firstName || user?.username || "there";

  return (
    <AccountView
      name={name}
      fullName={user?.fullName ?? ""}
      email={user?.primaryEmailAddress?.emailAddress ?? ""}
      tracks={TRACKS.filter((t) => profile.tracks.includes(t.id)).map((t) => {
        const ids = new Set((getContent(t.id)?.weeks ?? []).flatMap((w) => w.tasks.map((_, i) => `w${w.n}t${i}`)));
        const done = (profile.progress[t.id] ?? []).filter((id) => ids.has(id)).length;
        return { id: t.id, title: t.title, done, total: ids.size };
      })}
    />
  );
}
