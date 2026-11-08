"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

export type StoryWeek = { t: string; tasks: string[] };

// The landing page's one scroll-driven effect. This tall section pins its card while
// the scroll position inside it (0..1) drives the ring, the active week, the ticked
// tasks and the segment bars. Nothing else on the page reacts to scrolling.
export default function StoryCard({ weeks, track }: { weeks: StoryWeek[]; track: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [p, setP] = useState(0);

  useEffect(() => {
    if (reduce) {
      setP(1);
      return;
    }
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const v = -r.top / Math.max(1, r.height - window.innerHeight);
      setP(Math.max(0, Math.min(1, v)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [reduce]);

  const n = weeks.length;
  const step = Math.min(n - 1, Math.floor(p * n));
  const local = p * n - step;
  const week = weeks[step];

  return (
    <Box
      ref={ref}
      component="section"
      aria-label="Course progress, week by week"
      sx={{
        height: reduce ? "auto" : { xs: "360vh", md: "420vh" },
        py: reduce ? 9 : 0,
        background: "linear-gradient(180deg, #fafbfa, #f1f8f6 50%, #fafbfa)",
        borderTop: 1,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          position: reduce ? "static" : "sticky",
          top: 64,
          height: reduce ? "auto" : "calc(100vh - 64px)",
          display: "grid",
          alignItems: "center",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.05fr" }, gap: { xs: 3, md: 7 }, alignItems: "center" }}>
            <Box>
              <Chip label="Week by week" color="primary" variant="outlined" size="small" sx={{ bgcolor: "#e6f6f3", borderColor: "transparent" }} />
              <Typography variant="h2" sx={{ mt: 1.75, fontSize: { xs: 26, md: "clamp(28px, 3.6vw, 42px)" }, maxWidth: "16ch", textWrap: "balance" }}>
                Scroll, and watch six weeks fill up.
              </Typography>
              <Stepper
                activeStep={step}
                orientation="vertical"
                sx={{ mt: 3.5, display: { xs: "none", md: "flex" }, "& .MuiStepLabel-label": { fontWeight: 600, fontSize: 15 }, "& .MuiStepConnector-line": { minHeight: 10 } }}
              >
                {weeks.map((w) => (
                  <Step key={w.t}>
                    <StepLabel>{w.t}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Card aria-hidden sx={{ p: { xs: 2.25, md: 3.25 }, borderRadius: 4, boxShadow: "0 40px 80px -44px rgba(15,118,110,.55)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, md: 3 } }}>
                <Box sx={{ position: "relative", display: "inline-flex", flex: "none" }}>
                  <CircularProgress variant="determinate" value={100} size={112} thickness={4.5} sx={{ color: "#d9f0ec", position: "absolute" }} />
                  <CircularProgress variant="determinate" value={p * 100} size={112} thickness={4.5} sx={{ "& .MuiCircularProgress-circle": { strokeLinecap: "round", transition: "none" } }} />
                  <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
                      {Math.round(p * 100)}
                      <Typography component="span" sx={{ fontSize: 14, color: "text.secondary", fontWeight: 700 }}>%</Typography>
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{track} track</Typography>
                  <Typography variant="h6" sx={{ mt: 0.25 }}>Week {step + 1} of {n}</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 0.6, mt: 1.25 }}>
                    {weeks.map((w, i) => (
                      <LinearProgress key={w.t} variant="determinate" value={Math.max(0, Math.min(1, p * n - i)) * 100} sx={{ height: 7, "& .MuiLinearProgress-bar": { transition: "none" } }} />
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box key={step} sx={{ mt: 3 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Week {step + 1}: {week.t}
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1.1 }}>
                    {week.tasks.map((t, ti) => {
                      const done = local > (ti + 0.6) / (week.tasks.length + 0.4);
                      return (
                        <Box
                          key={t}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            pr: 1.5,
                            border: 1,
                            borderColor: done ? "#c9e8e2" : "divider",
                            bgcolor: done ? "#f3fbf9" : "background.paper",
                            borderRadius: 3,
                            color: done ? "text.secondary" : "text.primary",
                            transition: "background-color .3s, border-color .3s, color .3s",
                          }}
                        >
                          <Checkbox checked={done} disableRipple tabIndex={-1} readOnly />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{t}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
