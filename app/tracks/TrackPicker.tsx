"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import type { Track } from "@/lib/tracks";

export default function TrackPicker({
  tracks,
  joined,
  first,
}: {
  tracks: Track[];
  joined: string[];
  first: boolean;
}) {
  const router = useRouter();
  // Brand-new users with a single option available start with it ticked.
  const [picked, setPicked] = useState<string[]>(
    joined.length === 0 && tracks.length === 1 ? [tracks[0].id] : joined
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  async function submit() {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/tracks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tracks: picked }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Could not save");
      router.push(`/prep/${data.active}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
      setBusy(false);
    }
  }

  return (
    <Box sx={{ width: "100%", display: "grid", gap: 3, justifyItems: "center" }}>
      <Box role="group" aria-label="Tracks" sx={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 2 }}>
        {tracks.map((t) => {
          const on = picked.includes(t.id);
          return (
            <Card
              key={t.id}
              sx={{
                textAlign: "left",
                borderWidth: 1.5,
                borderColor: on ? "primary.main" : "divider",
                bgcolor: on ? "#f3fbf9" : "background.paper",
                boxShadow: on ? "0 0 0 3px rgba(15,118,110,.14)" : "none",
                transition: "transform .25s ease, box-shadow .25s ease, border-color .2s",
                "&:hover": { transform: "translateY(-4px)", borderColor: "#a7d8cf" },
              }}
            >
              <CardActionArea onClick={() => toggle(t.id)} sx={{ height: "100%" }}>
                <CardContent sx={{ p: 2.75, display: "grid", gap: 1 }}>
                  <Checkbox checked={on} tabIndex={-1} disableRipple sx={{ position: "absolute", top: 10, right: 10 }} slotProps={{ input: { "aria-label": `Follow ${t.title}` } }} />
                  <Typography variant="h5" sx={{ pr: 5 }}>{t.title}</Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.55 }}>{t.blurb}</Typography>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 600, mt: 0.5 }}>{t.meta}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
      {err && <Alert severity="error" sx={{ width: "100%", maxWidth: 520 }}>{err}</Alert>}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        {!first && (
          <Button variant="outlined" color="inherit" size="large" onClick={() => router.push("/prep")} disabled={busy} sx={{ borderColor: "divider" }}>
            Cancel
          </Button>
        )}
        <Button variant="contained" size="large" onClick={submit} disabled={busy || picked.length === 0}>
          {busy ? "Saving..." : first ? "Continue" : "Save"}
        </Button>
      </Box>
    </Box>
  );
}
