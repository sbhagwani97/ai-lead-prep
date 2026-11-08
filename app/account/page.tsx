import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton, UserButton } from "@clerk/nextjs";

export default async function Account() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <main className="center">
      <UserButton />
      <h1>Your account</h1>
      <p>Your progress is saved to your account, so it follows you across devices.</p>
      <div className="row">
        <Link className="btn primary" href="/prep">Back to the plan</Link>
        <SignOutButton redirectUrl="/">
          <button className="btn">Sign out</button>
        </SignOutButton>
      </div>
    </main>
  );
}
