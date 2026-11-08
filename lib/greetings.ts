// Greetings shown at the top of the course page. One is picked at random per visit
// (on the server, so it stays stable while the page hydrates). {name} is the first name.
const RETURNING = [
  "Welcome back, {name}!",
  "Good to see you again, {name}.",
  "Back at it, {name}!",
  "Hey {name}, ready for another session?",
  "Nice to have you back, {name}.",
  "Let's pick up where you left off, {name}.",
  "Welcome back, {name}. One more tick today?",
  "Glad you're here, {name}. Let's keep going.",
];

// Same lines without a name, for accounts that have no first name.
const RETURNING_NO_NAME = [
  "Welcome back!",
  "Good to see you again.",
  "Back at it!",
  "Ready for another session?",
  "Nice to have you back.",
  "Let's pick up where you left off.",
];

export function pickGreeting(firstName: string | null | undefined, returning: boolean): string {
  const name = firstName?.trim();
  if (!returning) return name ? `Welcome to Preppy, ${name}!` : "Welcome to Preppy!";
  const list = name ? RETURNING : RETURNING_NO_NAME;
  const line = list[Math.floor(Math.random() * list.length)];
  return line.replace("{name}", name ?? "");
}
