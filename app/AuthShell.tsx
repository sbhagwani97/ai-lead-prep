"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const POINTS = [
  "A 6-week plan for each track",
  "Concepts, tools and study links at interview depth",
  "Progress saved to your account, on every device",
];

export default function AuthShell({ mode, children }: { mode: "in" | "up"; children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "5fr 6fr" }, bgcolor: "background.default" }}>
      <Box
        component="aside"
        sx={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 4,
          p: { xs: "24px 20px", md: "40px 48px" },
          color: "#fff",
          background: "radial-gradient(70% 60% at 85% 0%, #14b8a6, transparent 60%), radial-gradient(60% 50% at 0% 100%, #14b8a6, transparent 60%), linear-gradient(160deg, #115e59, #0f766e)",
          "&::after": { content: '""', position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.14) 1px, transparent 1px)", backgroundSize: "22px 22px", maskImage: "linear-gradient(180deg, transparent, #000 40%, transparent)", pointerEvents: "none" },
          "& > *": { position: "relative", zIndex: 1 },
        }}
      >
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: "#fff", textDecoration: "none" }}>
          <img src="/logo-mark.svg" alt="" width={30} height={30} />
          Preppy
        </Link>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: 26, md: "clamp(30px, 3.4vw, 44px)" }, maxWidth: { md: "14ch" }, textWrap: "balance" }}>
            {mode === "up" ? "Start preparing with a plan." : "Welcome back."}
          </Typography>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography sx={{ mt: 1.75, color: "rgba(255,255,255,.82)", fontSize: 17, lineHeight: 1.55, maxWidth: "36ch" }}>
              {mode === "up" ? "Create your account, pick a track, and open week one." : "Pick up right where you left off."}
            </Typography>
            <List sx={{ mt: 3 }} disablePadding>
              {POINTS.map((p) => (
                <ListItem key={p} disableGutters sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 34 }}>
                    <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "rgba(255,255,255,.18)", display: "grid", placeItems: "center" }}>
                      <CheckIcon sx={{ fontSize: 14, color: "#fff" }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary={p} slotProps={{ primary: { sx: { fontSize: 15, color: "rgba(255,255,255,.92)" } } }} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ display: { xs: "none", md: "block" }, color: "rgba(255,255,255,.7)" }}>
          Made with &lt;3 by Shivam and Claude
        </Typography>
      </Box>

      <Box component="main" sx={{ position: "relative", display: "grid", placeItems: "center", p: { xs: "72px 16px 40px", md: "72px 24px 40px" } }}>
        <Button component={Link} href="/" size="small" color="inherit" startIcon={<ArrowBackIcon />} sx={{ position: "absolute", top: 20, left: 20, color: "text.secondary" }}>
          Back to home
        </Button>
        <Box sx={{ width: "100%", maxWidth: 420, display: "flex", justifyContent: "center" }}>{children}</Box>
      </Box>
    </Box>
  );
}
