import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { setTracks } from "@/lib/progress";

export const dynamic = "force-dynamic";

// Sets the full list of tracks the user follows. Leaving a track keeps its ticks.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const result = await setTracks(userId, (body as { tracks?: unknown })?.tracks as string[]);
  if (!result) return NextResponse.json({ error: "pick at least one track" }, { status: 400 });
  return NextResponse.json({ ok: true, ...result });
}
