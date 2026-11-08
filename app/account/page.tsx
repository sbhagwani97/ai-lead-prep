import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import AppNav from "@/app/AppNav";
import { loadProfile } from "@/lib/progress";
import { TRACKS } from "@/lib/tracks";

export const dynamic = "force-dynamic";

export default async function Account() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, profile] = await Promise.all([currentUser(), loadProfile(userId)]);
  const name = user?.firstName || user?.username || "there";
  const joined = TRACKS.filter((t) => profile.tracks.includes(t.id));

  return (
    <div className="ap">
      <AppNav />
      <main className="ap-main">
        <h1>Hi, {name}</h1>
        <p>Your progress is saved to your account, so it follows you across devices.</p>

        <section className="ap-card">
          <div className="ap-who">
            <UserButton />
            <div>
              <b>{user?.fullName || name}</b>
              <span>{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
          </div>
          <h2>Your tracks</h2>
          <p>
            {joined.length
              ? joined.map((t) => t.title).join(", ")
              : "You have not joined a track yet."}
          </p>
          <div className="ap-row" style={{ justifyContent: "flex-start" }}>
            <Link className="ap-btn primary" href="/prep">Back to the plan</Link>
            <Link className="ap-btn" href="/tracks">Manage tracks</Link>
            <SignOutButton redirectUrl="/">
              <button className="ap-btn">Sign out</button>
            </SignOutButton>
          </div>
        </section>
      </main>
    </div>
  );
}
