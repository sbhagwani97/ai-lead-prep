import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TRACKS } from "@/lib/tracks";
import LandingView from "./landing/LandingView";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/prep");
  return <LandingView tracks={TRACKS} />;
}
