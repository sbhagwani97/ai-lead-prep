import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cleanTicks, saveTicks } from "@/lib/progress";
import { isTrackId } from "@/lib/tracks";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const { track, ticks: raw } = (body ?? {}) as { track?: unknown; ticks?: unknown };
  if (!isTrackId(track)) return NextResponse.json({ error: "unknown track" }, { status: 400 });

  const ticks = cleanTicks(raw);
  const ok = await saveTicks(userId, track, ticks);
  if (!ok) return NextResponse.json({ error: "not joined" }, { status: 403 });
  return NextResponse.json({ ok: true, count: ticks.length });
}
