import { auth, clerkClient } from "@clerk/nextjs/server";

// Task ids look like w3t5 (week 3, task 5). Anything else is rejected.
const ID_RE = /^w[1-9]\d?t\d{1,2}$/;
export const MAX_TICKS = 200;

export function cleanTicks(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out = new Set<string>();
  for (const v of input) {
    if (typeof v === "string" && ID_RE.test(v)) out.add(v);
    if (out.size >= MAX_TICKS) break;
  }
  return [...out].sort();
}

export async function loadTicks(userId: string): Promise<string[]> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return cleanTicks((user.privateMetadata as { ticks?: unknown }).ticks);
}

export async function saveTicks(userId: string, ticks: string[]) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, { privateMetadata: { ticks } });
}

export { auth };
