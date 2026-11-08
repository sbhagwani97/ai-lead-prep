import Link from "next/link";
import type { ReactNode } from "react";
import "./auth.css";

const POINTS = [
  "A 6-week plan for each track",
  "Concepts, tools and study links at interview depth",
  "Progress saved to your account, on every device",
];

export default function AuthShell({ mode, children }: { mode: "in" | "up"; children: ReactNode }) {
  return (
    <div className="au">
      <aside className="au-side">
        <Link href="/" className="au-brand">
          <img src="/logo-mark.svg" alt="" width={30} height={30} />
          Preppy
        </Link>
        <div className="au-copy">
          <h1>{mode === "up" ? "Start preparing with a plan." : "Welcome back."}</h1>
          <p>
            {mode === "up"
              ? "Create your account, pick a track, and open week one."
              : "Pick up right where you left off."}
          </p>
          <ul>
            {POINTS.map((p) => (
              <li key={p}>
                <svg viewBox="0 0 16 16" aria-hidden><path d="M3.5 8.5l3 3 6-7" /></svg>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <span className="au-foot">Made with &lt;3 by Shivam and Claude</span>
      </aside>
      <main className="au-main">
        <Link href="/" className="au-back">&larr; Back to home</Link>
        <div className="au-form">{children}</div>
      </main>
    </div>
  );
}
