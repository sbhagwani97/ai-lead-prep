"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

const TASKS = [
  "Read concepts 2.1 and 2.2",
  "Lab: structured output with validation",
  "Set up Postgres with pgvector",
  "Build RAG v1 with citations",
];

// A small looping demo (time-based, not scroll-based): tasks tick themselves one by one.
export default function HeroDemo({ track }: { track: string }) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [done, setDone] = useState(2);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setDone((d) => (d >= TASKS.length ? 0 : d + 1)), 1100);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <Paper
      aria-hidden
      sx={{ border: 1, borderColor: "divider", borderRadius: 4, overflow: "hidden", boxShadow: "0 40px 80px -40px rgba(15,118,110,.45)" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", bgcolor: "#fafafa" }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#dfe1ea" }} />
        ))}
        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1 }}>Preppy</Typography>
        <Chip label={track} size="small" variant="outlined" sx={{ ml: "auto", bgcolor: "#fff" }} />
      </Box>
      <Box sx={{ p: 2.5, display: "grid", gap: 1.75 }}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>Week 1</Typography>
          <Typography variant="body2" color="text.secondary">Foundations, prompting, RAG basics</Typography>
        </Box>
        <LinearProgress variant="determinate" value={(done / TASKS.length) * 100} sx={{ "& .MuiLinearProgress-bar": { transition: "transform .6s ease" } }} />
        <Box sx={{ display: "grid", gap: 1.1 }}>
          {TASKS.map((t, i) => {
            const on = i < done;
            return (
              <Box
                key={t}
                sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1.5, border: 1, borderColor: "divider", borderRadius: 3, bgcolor: on ? "#f3fbf9" : "#fff", transition: "background-color .3s" }}
              >
                <Checkbox checked={on} disableRipple tabIndex={-1} readOnly />
                <Typography variant="body2">{t}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}
