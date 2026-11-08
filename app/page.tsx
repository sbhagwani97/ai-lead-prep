import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/prep");

  return (
    <main className="center">
      <h1>AI lead interviews: only what job descriptions ask for</h1>
      <p>
        A 6-week plan with 13 concepts, the tools that show up in JDs, and study links.
        Sign in to open it and keep your own progress.
      </p>
      <div className="row">
        <Link className="btn primary" href="/sign-in">Sign in</Link>
        <Link className="btn" href="/sign-up">Create account</Link>
      </div>
      <div className="foot">Made with &lt;3 by Shivam and Claude</div>
    </main>
  );
}
