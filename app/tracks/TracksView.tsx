"use client";

import { UserButton } from "@clerk/nextjs";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import AppNav from "../AppNav";
import type { Track } from "@/lib/tracks";
import TrackPicker from "./TrackPicker";

export default function TracksView({ tracks, joined }: { tracks: Track[]; joined: string[] }) {
  const first = joined.length === 0;
  return (
    <Box sx={{ minHeight: "100vh", background: "radial-gradient(50% 40% at 85% 0%, rgba(45,212,191,.14), transparent 70%), radial-gradient(40% 40% at 0% 20%, rgba(20,184,166,.1), transparent 70%), #fafbfa" }}>
      <AppNav right={<UserButton />} />
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 }, display: "grid", gap: 3.5, justifyItems: "center", textAlign: "center" }}>
        <Typography variant="h1" sx={{ fontSize: "clamp(30px, 4.4vw, 46px)", background: "linear-gradient(100deg,#115e59,#0f766e 70%,#14b8a6)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          {first ? "Pick your track" : "Your tracks"}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 17, lineHeight: 1.6, maxWidth: "52ch", mt: -1.5 }}>
          {first
            ? "Choose what you want to prepare for. You can follow more than one and switch any time."
            : "Add or remove tracks. Removing one keeps your progress if you add it back later."}
        </Typography>
        <TrackPicker tracks={tracks} joined={joined} first={first} />
      </Container>
    </Box>
  );
}
