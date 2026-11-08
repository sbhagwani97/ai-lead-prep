import { readFileSync } from "node:fs";
import path from "node:path";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { loadTicks } from "@/lib/progress";

export const dynamic = "force-dynamic";

const TEMPLATE = readFileSync(path.join(process.cwd(), "content", "prep.html"), "utf8");

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));

  const [ticks, user] = await Promise.all([loadTicks(userId), currentUser()]);
  const name =
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress ||
    user?.username ||
    "you";

  // Escape "<" so user-controlled text can never close the script tag.
  const boot = JSON.stringify({ ticks, name }).replace(/</g, "\\u003c");
  const html = TEMPLATE.replace(
    "<!--PREP_BOOT-->",
    `<script>window.__PREP__=${boot};</script>`
  );

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
    },
  });
}
