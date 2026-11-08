"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

const KEY = "preppy-greeted";
const TYPE_MS = 48;
const HOLD_MS = 900;
const FADE_MS = 650;

// Full-screen greeting that types itself out (first name in teal), holds for a moment,
// then fades into the course page. Plays once per browser session, so switching tracks
// does not replay it. Any click or key press skips it.
export default function GreetingIntro({ text, name }: { text: string; name: string }) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<"typing" | "fading" | "gone">("typing");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch { /* storage unavailable */ }
    if (seen) {
      setPhase("gone");
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
    const finish = () => {
      // Marked as seen only once it has played, so a double effect run (React strict mode)
      // or an interrupted load does not swallow it.
      try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
      setPhase("fading");
      later(() => {
        setPhase("gone");
        document.body.style.overflow = prevOverflow;
      }, FADE_MS);
    };

    if (reduce) {
      setTyped(text.length);
      later(finish, 1200);
    } else {
      let i = 0;
      const tick = () => {
        i += 1;
        setTyped(i);
        if (i < text.length) later(tick, TYPE_MS);
        else later(finish, HOLD_MS);
      };
      later(tick, 450);
    }

    const skip = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setTyped(text.length);
      finish();
    };
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      timers.current.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      document.body.style.overflow = prevOverflow;
    };
  }, [text, reduce]);

  if (phase === "gone") return null;

  // Split the greeting around the first name so the name can be teal as it is typed.
  const at = name ? text.indexOf(name) : -1;
  const shown = text.slice(0, typed);
  const before = at >= 0 ? shown.slice(0, at) : shown;
  const nameShown = at >= 0 ? shown.slice(at, at + name.length) : "";
  const after = at >= 0 ? shown.slice(at + name.length) : "";

  return (
    <Box
      role="status"
      aria-label={text}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        bgcolor: "#fff",
        display: "grid",
        placeItems: "center",
        px: 3,
        opacity: phase === "fading" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      <Typography
        aria-hidden
        component="p"
        sx={{ m: 0, textAlign: "center", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: "#171717", fontSize: "clamp(30px, 6vw, 64px)", maxWidth: "20ch", minHeight: "2.4em", display: "flex", alignItems: "center", justifyContent: "center", textWrap: "balance" }}
      >
        <span>
          {before}
          <Box component="span" sx={{ color: "#0f766e" }}>{nameShown}</Box>
          {after}
          <Box
            component="span"
            sx={{ display: "inline-block", width: "0.06em", height: "0.95em", ml: "0.08em", verticalAlign: "-0.1em", bgcolor: "#0f766e", animation: "gi-blink 1s steps(1) infinite", "@keyframes gi-blink": { "50%": { opacity: 0 } } }}
          />
        </span>
      </Typography>
      <Typography sx={{ position: "absolute", bottom: 28, fontSize: 13, color: "#8a8f8d" }}>Click anywhere to skip</Typography>
    </Box>
  );
}
