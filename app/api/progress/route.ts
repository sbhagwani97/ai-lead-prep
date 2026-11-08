import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cleanTicks, saveTicks } from "@/lib/progress";

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
  const ticks = cleanTicks((body as { ticks?: unknown })?.ticks);
  await saveTicks(userId, ticks);
  return NextResponse.json({ ok: true, count: ticks.length });
}
