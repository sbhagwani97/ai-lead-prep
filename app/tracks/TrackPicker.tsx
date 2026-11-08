"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="picker">
      <div className="cards" role="group" aria-label="Tracks">
        {tracks.map((t) => {
          const on = picked.includes(t.id);
          return (
            <label key={t.id} className={"card" + (on ? " on" : "")}>
              <input type="checkbox" checked={on} onChange={() => toggle(t.id)} />
              <span className="ct">{t.title}</span>
              <span className="cb">{t.blurb}</span>
              <span className="cm">{t.meta}</span>
            </label>
          );
        })}
      </div>
      {err && <div className="err" role="alert">{err}</div>}
      <div className="row">
        {!first && (
          <button className="btn" onClick={() => router.push("/prep")} disabled={busy}>
            Cancel
          </button>
        )}
        <button className="btn primary" onClick={submit} disabled={busy || picked.length === 0}>
          {busy ? "Saving..." : first ? "Continue" : "Save"}
        </button>
      </div>
    </div>
  );
}
