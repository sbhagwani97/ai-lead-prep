import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { loadProfile } from "@/lib/progress";
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
      tracks={TRACKS.filter((t) => profile.tracks.includes(t.id)).map((t) => t.title)}
    />
  );
}
