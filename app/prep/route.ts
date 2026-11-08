import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { loadProfile } from "@/lib/progress";

export const dynamic = "force-dynamic";

// /prep is just a doorway: it sends people to their last track, or to the picker.
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));

  const profile = await loadProfile(userId);
  const target = profile.last ?? profile.tracks[0];
  return NextResponse.redirect(new URL(target ? `/prep/${target}` : "/tracks", req.url));
}
