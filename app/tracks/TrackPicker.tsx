"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import type { Track } from "@/lib/tracks";

export default function TrackPicker({
  tracks,
  joined,
  first,
  previews,
}: {
  tracks: Track[];
  joined: string[];
  first: boolean;
  previews: Record<string, string[]>;
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
          const weeks = previews[t.id] ?? [];
          return (
            <Card
              key={t.id}
              sx={{
                textAlign: "left",
                borderWidth: 2,
                borderColor: on ? "primary.main" : "divider",
                bgcolor: on ? "#f3fbf9" : "background.paper",
                boxShadow: on ? "0 0 0 4px rgba(15,118,110,.12), 0 24px 44px -30px rgba(15,118,110,.55)" : "none",
                transition: "transform .25s ease, box-shadow .25s ease, border-color .2s, background-color .2s",
                "&:hover": { transform: "translateY(-3px)", borderColor: on ? "primary.main" : "#a7d8cf" },
              }}
            >
              <CardActionArea onClick={() => toggle(t.id)} aria-pressed={on} aria-label={`${on ? "Following" : "Follow"} ${t.title}`} sx={{ height: "100%", alignItems: "stretch" }}>
                <CardContent sx={{ p: 2.75, display: "grid", gap: 1, alignContent: "start" }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                    <Typography variant="h5">{t.title}</Typography>
                    <Box
                      component="span"
                      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, flex: "none", px: 1.1, py: 0.4, borderRadius: 99, fontSize: 12.5, fontWeight: 700, transition: "all .2s", ...(on ? { bgcolor: "primary.main", color: "#fff" } : { border: 1, borderColor: "divider", color: "text.secondary" }) }}
                    >
                      {on ? <CheckIcon sx={{ fontSize: 15 }} /> : <AddIcon sx={{ fontSize: 15 }} />}
                      {on ? "Following" : "Follow"}
                    </Box>
                  </Box>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.55 }}>{t.blurb}</Typography>
                  {weeks.length > 0 && (
                    <Box component="ol" sx={{ m: 0, mt: 0.75, p: 0, listStyle: "none", display: "grid", gap: 0.5 }}>
                      {weeks.map((w, i) => (
                        <Box component="li" key={w} sx={{ display: "flex", gap: 1.25, fontSize: 13.5, color: "text.secondary", lineHeight: 1.45 }}>
                          <Box component="span" sx={{ width: 58, flex: "none", whiteSpace: "nowrap", color: "primary.main", fontWeight: 600 }}>Week {i + 1}</Box>
                          <span>{w}</span>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 600, mt: 0.75 }}>{t.meta}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
      {err && <Alert severity="error" sx={{ width: "100%", maxWidth: 520 }}>{err}</Alert>}
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        {!first && (
          <Button variant="outlined" color="inherit" size="large" onClick={() => router.push("/prep")} disabled={busy} sx={{ borderColor: "divider" }}>
            Cancel
          </Button>
        )}
        <Button variant="contained" size="large" onClick={submit} disabled={busy || picked.length === 0}>
          {busy ? "Saving..." : picked.length === 0 ? "Pick a track to continue" : first ? `Start ${picked.length === 1 ? tracks.find((t) => t.id === picked[0])?.title ?? "" : `${picked.length} tracks`}` : "Save"}
        </Button>
      </Box>
    </Box>
  );
}
