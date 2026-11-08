"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { TrackContent } from "@/lib/track-content";

const TABS = [
  { id: "jd", label: "What JDs ask" },
  { id: "concepts", label: "Concepts" },
  { id: "tools", label: "Tools" },
  { id: "plan", label: "6-week plan" },
  { id: "sources", label: "Sources" },
];

const TIER: Record<string, { bg: string; fg: string }> = {
  t1: { bg: "#d9f0ec", fg: "#115e59" },
  t2: { bg: "#fef3c7", fg: "#b45309" },
  t3: { bg: "#f1f3f2", fg: "#4b5563" },
};
const RT: Record<string, { bg: string; fg: string }> = {
  V: { bg: "#ffe4e6", fg: "#be123c" },
  D: { bg: "#e0f2fe", fg: "#0369a1" },
  P: { bg: "#e2e8f0", fg: "#334155" },
  A: { bg: "#d1fae5", fg: "#047857" },
  C: { bg: "#fef3c7", fg: "#b45309" },
};
const WEEK_COLORS = ["#0f766e", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#64748b"];

const heading = { fontSize: { xs: 24, md: 32 } } as const;
const lead = { color: "text.secondary", maxWidth: "70ch", mt: 1.5, mb: 3, fontSize: 16, lineHeight: 1.65, "& a": { color: "primary.main" } } as const;
const html = (h: string) => ({ __html: h });
const fmt = (h: number) => (h % 1 === 0 ? h : h.toFixed(1)) + "h";
const accSx = {
  border: 1,
  borderColor: "divider",
  borderRadius: "16px !important",
  mb: 1.5,
  overflow: "hidden",
  transition: "border-color .25s, box-shadow .25s",
  "&:before": { display: "none" },
  "&:hover": { borderColor: "#b9ded6" },
  "&.Mui-expanded": { borderColor: "#a7d8cf", boxShadow: "0 20px 40px -30px rgba(15,118,110,.5)", margin: "0 0 12px" },
} as const;

function Badge({ n }: { n: number }) {
  return (
    <Avatar variant="rounded" sx={{ width: 34, height: 34, fontSize: 14, fontWeight: 700, borderRadius: 2.5, background: "linear-gradient(135deg,#0f766e,#14b8a6)" }}>
      {n}
    </Avatar>
  );
}

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
      <Badge n={n} />
      <Typography variant="h2" sx={heading}>{children}</Typography>
    </Box>
  );
}

function Tier({ t, label }: { t: string; label: string }) {
  const c = TIER[t] ?? TIER.t3;
  return <Chip size="small" label={label} sx={{ bgcolor: c.bg, color: c.fg, fontWeight: 700 }} />;
}

export default function CourseView({
  content,
  trackId,
  trackTitle,
  joined,
  initialTicks,
}: {
  content: TrackContent;
  trackId: string;
  trackTitle: string;
  joined: { id: string; title: string }[];
  initialTicks: string[];
}) {
  const router = useRouter();

  // ----- progress, saved to the account -----
  const [ticks, setTicks] = useState<Set<string>>(() => new Set(initialTicks));
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(false);
  const dirty = useRef(false);
  const latest = useRef(ticks);
  latest.current = ticks;

  const flush = useCallback(() => {
    if (saving.current) {
      dirty.current = true;
      return;
    }
    saving.current = true;
    dirty.current = false;
    setStatus("Saving...");
    fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ track: trackId, ticks: [...latest.current] }),
      keepalive: true,
    })
      .then((r) => {
        if (r.status === 401) {
          location.href = "/sign-in";
          return;
        }
        setStatus(r.ok ? "Saved" : "Not saved. Retrying on next tick");
      })
      .catch(() => setStatus("Offline. Retrying on next tick"))
      .then(() => {
        saving.current = false;
        if (dirty.current) flush();
      });
  }, [trackId]);

  const scheduleSave = useCallback(() => {
    setStatus("Saving...");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 500);
  }, [flush]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const toggleTick = (id: string, on: boolean) => {
    setTicks((prev) => {
      const next = new Set(prev);
      if (on) next.add(id); else next.delete(id);
      return next;
    });
    scheduleSave();
  };
  const clearTicks = () => {
    setTicks(new Set());
    scheduleSave();
  };

  // ----- derived plan data -----
  const weeks = useMemo(
    () =>
      content.weeks.map((w) => {
        const tasks = w.tasks.map((t, ti) => {
          const [h, ...rest] = t.split("|");
          return { id: `w${w.n}t${ti}`, hours: parseFloat(h), text: rest.join("|") };
        });
        return { ...w, tasks, total: tasks.reduce((a, t) => a + t.hours, 0) };
      }),
    [content.weeks]
  );
  const allIds = useMemo(() => weeks.flatMap((w) => w.tasks.map((t) => t.id)), [weeks]);
  const doneCount = allIds.filter((i) => ticks.has(i)).length;
  const weekDone = (w: (typeof weeks)[number]) => w.tasks.filter((t) => ticks.has(t.id)).length;

  // ----- tabs (kept in the URL hash) and open/closed cards -----
  const [tab, setTab] = useState(0);
  useEffect(() => {
    const i = TABS.findIndex((t) => t.id === location.hash.slice(1));
    if (i >= 0) setTab(i);
  }, []);
  const [openConcepts, setOpenConcepts] = useState<Set<number>>(new Set([0]));
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]));
  const flip = (set: Set<number>, k: number) => {
    const n = new Set(set);
    if (n.has(k)) n.delete(k); else n.add(k);
    return n;
  };
  const openWeek = (n: number) => {
    setOpenWeeks((s) => new Set(s).add(n));
    setTimeout(() => document.getElementById("week" + n)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: "rgba(250,251,250,.86)", backdropFilter: "saturate(1.4) blur(12px)", borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 64, gap: { xs: 1, md: 2 }, flexWrap: "wrap", py: { xs: 1, md: 0 } }}>
            <Link href="/prep" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: "inherit", textDecoration: "none" }}>
              <img src="/logo-mark.svg" alt="" width={26} height={26} />
              Preppy
            </Link>
            <Select
              size="small"
              value={trackId}
              onChange={(e) => router.push(e.target.value === "__manage" ? "/tracks" : `/prep/${e.target.value}`)}
              sx={{ fontWeight: 600, fontSize: 14, borderRadius: 2.5, bgcolor: "#fff", maxWidth: 220 }}
              inputProps={{ "aria-label": "Switch track" }}
            >
              {joined.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>
              ))}
              <Divider />
              <MenuItem value="__manage">Add or manage tracks...</MenuItem>
            </Select>
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5, flex: { xs: "1 1 100%", sm: "0 1 auto" }, order: { xs: 3, sm: 0 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                {doneCount} of {allIds.length} tasks
              </Typography>
              <LinearProgress variant="determinate" value={allIds.length ? (100 * doneCount) / allIds.length : 0} sx={{ width: { xs: "auto", sm: 140 }, flex: { xs: 1, sm: "none" } }} />
              <Typography variant="caption" color="text.secondary" aria-live="polite" sx={{ display: { xs: "none", md: "block" }, minWidth: 56 }}>{status}</Typography>
            </Box>
            <Button component={Link} href="/account" variant="outlined" color="inherit" size="small" sx={{ borderColor: "divider", bgcolor: "#fff", ml: { xs: "auto", sm: 0 } }}>
              Account
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ pb: 10 }}>
        {/* hero */}
        <Paper
          component="header"
          sx={{
            position: "relative",
            overflow: "hidden",
            mt: 3.5,
            mb: 3,
            p: { xs: "30px 22px", md: "44px 40px" },
            borderRadius: 6,
            border: 1,
            borderColor: "divider",
            background: "radial-gradient(60% 90% at 100% 0%, rgba(45,212,191,.2), transparent 60%), radial-gradient(50% 70% at 0% 100%, rgba(20,184,166,.12), transparent 60%), #fff",
          }}
        >
          <Typography variant="h1" sx={{ fontSize: "clamp(30px, 4.6vw, 52px)", maxWidth: "20ch", textWrap: "balance", background: "linear-gradient(100deg,#115e59,#0f766e 70%,#14b8a6)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            {content.hero.h1}
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: "60ch", color: "text.secondary", fontSize: 17, lineHeight: 1.6 }}>{content.hero.p}</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2.75 }}>
            {content.hero.chips.map((c, i) => {
              const cols = [["#d9f0ec", "#115e59"], ["#e0f2fe", "#0369a1"], ["#fef3c7", "#b45309"], ["#d1fae5", "#047857"]][i % 4];
              return <Chip key={c} label={c} sx={{ bgcolor: cols[0], color: cols[1] }} />;
            })}
          </Box>
        </Paper>

        {/* tabs */}
        <Box sx={{ position: "sticky", top: { xs: 108, sm: 64 }, zIndex: 40, bgcolor: "background.default", py: 1.25, mb: 1.5 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => {
              setTab(v);
              try { history.replaceState(null, "", "#" + TABS[v].id); } catch { /* ignore */ }
              window.scrollTo({ top: 0 });
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ bgcolor: "#e6f6f3", borderRadius: 3.5, p: 0.6, minHeight: 0, "& .MuiTabs-indicator": { display: "none" }, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 0, py: 1, borderRadius: 2.5, color: "text.secondary" }, "& .Mui-selected": { bgcolor: "#fff", color: "primary.main !important", boxShadow: "0 2px 8px -2px rgba(15,118,110,.3)" } }}
          >
            {TABS.map((t) => (
              <Tab key={t.id} label={t.label} disableRipple />
            ))}
          </Tabs>
        </Box>

        {/* 1. JD */}
        {tab === 0 && (
          <Box component="section">
            <SectionTitle n={1}>What job descriptions actually ask for</SectionTitle>
            <Typography sx={lead} dangerouslySetInnerHTML={html(content.jd.lead)} />
            <TableContainer component={Paper} sx={{ border: 1, borderColor: "divider", borderRadius: 4, boxShadow: "0 20px 40px -32px rgba(15,118,110,.35)" }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#e6f6f3", "& th": { color: "primary.main", fontWeight: 700, fontSize: 12, letterSpacing: ".04em", textTransform: "uppercase" } }}>
                    <TableCell>Tier</TableCell>
                    <TableCell>Skill or tool</TableCell>
                    <TableCell>Where it shows up</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {content.jd.rows.map((r) => (
                    <TableRow key={r.name} hover sx={{ "&:last-child td": { border: 0 }, verticalAlign: "top" }}>
                      <TableCell><Tier t={r.tier} label={r.tierLabel} /></TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                      <TableCell dangerouslySetInnerHTML={html(r.where)} sx={{ "& a": { color: "primary.main" } }} />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, p: 1.75, bgcolor: "#f1f3f2", borderRadius: 3, "& a": { color: "primary.main" } }} dangerouslySetInnerHTML={html(content.jd.note)} />
          </Box>
        )}

        {/* 2. concepts */}
        {tab === 1 && (
          <Box component="section">
            <SectionTitle n={2}>Concepts at interview depth</SectionTitle>
            <Typography sx={lead} dangerouslySetInnerHTML={html(content.conceptsLead)} />
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button size="small" variant="outlined" color="inherit" sx={{ borderColor: "divider", bgcolor: "#fff" }} onClick={() => setOpenConcepts(new Set(content.concepts.map((_, i) => i)))}>Expand all</Button>
              <Button size="small" variant="outlined" color="inherit" sx={{ borderColor: "divider", bgcolor: "#fff" }} onClick={() => setOpenConcepts(new Set())}>Collapse all</Button>
            </Box>
            {content.concepts.map((c, k) => {
              const n = `2.${k + 1}`;
              const rs = content.res[k] ?? [];
              return (
                <Accordion key={c.t} id={`c${k + 1}`} expanded={openConcepts.has(k)} onChange={() => setOpenConcepts((s) => flip(s, k))} disableGutters elevation={0} slotProps={{ transition: { unmountOnExit: true } }} sx={accSx}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />} sx={{ px: 2.75, py: 0.75 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{n} {c.t}</Typography>
                      <Typography variant="body2" color="text.secondary">{c.s}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2.75, pb: 2.75, pt: 0.5, borderTop: 1, borderColor: "divider" }}>
                    {c.subs.map((s, si) => (
                      <Box key={s.h} sx={{ mt: 2.25 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "primary.main", mb: 1 }}>{n}.{si + 1} {s.h}</Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2.5, "& li": { my: 0.75 }, "& li::marker": { color: "#14b8a6" }, "& a": { color: "primary.main" } }}>
                          {s.l.map((li, i) => (
                            <li key={i} dangerouslySetInnerHTML={html(li)} />
                          ))}
                        </Box>
                      </Box>
                    ))}
                    <Box sx={{ mt: 2.5, p: 2, borderRadius: 3.5, border: 1, borderColor: "#c9e8e2", background: "linear-gradient(135deg,#f3fbf9,#e6f6f3)", color: "#0b4a45", fontSize: 14.5 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "primary.main", mb: 0.5 }}>Say in an interview</Typography>
                      <span dangerouslySetInnerHTML={html(c.say)} />
                    </Box>
                    {rs.length > 0 && (
                      <Box sx={{ mt: 2.5 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "primary.main", mb: 1 }}>{n}.{c.subs.length + 1} Study material</Typography>
                        <Box sx={{ display: "grid", gap: 1 }}>
                          {rs.map((r) => {
                            const col = RT[r.type] ?? RT.A;
                            return (
                              <Box key={r.url + r.title} sx={{ display: "flex", gap: 1.5, alignItems: "baseline" }}>
                                <Chip size="small" label={content.rtype[r.type as keyof typeof content.rtype]?.[0] ?? r.type} sx={{ bgcolor: col.bg, color: col.fg, fontWeight: 700, fontSize: 11, minWidth: 62, flex: "none" }} />
                                <Typography variant="body2">
                                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "#0f766e" }}>{r.title}</a>{" "}
                                  <Box component="span" sx={{ color: "text.secondary" }}>- {r.why}</Box>
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}

        {/* 3. tools */}
        {tab === 2 && (
          <Box component="section">
            <SectionTitle n={3}>Tools: one line each</SectionTitle>
            <Typography sx={lead} dangerouslySetInnerHTML={html(content.toolsLead)} />
            {content.tools.map((g, gi) => (
              <Box key={g.group} sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "primary.main", mb: 1.25 }}>3.{gi + 1} {g.group}</Typography>
                <TableContainer component={Paper} sx={{ border: 1, borderColor: "divider", borderRadius: 4 }}>
                  <Table sx={{ minWidth: 560 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#e6f6f3", "& th": { color: "primary.main", fontWeight: 700, fontSize: 12, letterSpacing: ".04em", textTransform: "uppercase" } }}>
                        <TableCell>Tool</TableCell>
                        <TableCell>What it is for</TableCell>
                        <TableCell>Depth</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {g.items.map((it) => {
                        const link = (content.toolLinks as Record<string, string>)[it.name];
                        return (
                          <TableRow key={it.name} hover sx={{ "&:last-child td": { border: 0 } }}>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {link ? <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: "#0f766e" }}>{it.name}</a> : it.name}
                            </TableCell>
                            <TableCell>{it.what}</TableCell>
                            <TableCell><Tier t={it.tier} label={it.depth} /></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Box>
        )}

        {/* 4. plan */}
        {tab === 3 && (
          <Box component="section">
            <SectionTitle n={4}>6-week plan</SectionTitle>
            <Typography sx={lead} dangerouslySetInnerHTML={html(content.plan.lead)} />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(3,1fr)" }, gap: 1.75, mb: 2.5 }}>
              {weeks.map((w, i) => (
                <ButtonBase
                  key={w.n}
                  onClick={() => openWeek(w.n)}
                  sx={{ display: "block", textAlign: "left", position: "relative", overflow: "hidden", bgcolor: "#fff", border: 1, borderColor: "divider", borderRadius: 4, p: 2.25, transition: "transform .25s ease, box-shadow .25s ease, border-color .25s", "&:hover": { transform: "translateY(-4px)", borderColor: "#b9ded6", boxShadow: "0 22px 40px -26px rgba(15,118,110,.55)" }, "&::before": { content: '""', position: "absolute", inset: "0 0 auto 0", height: 4, bgcolor: WEEK_COLORS[i % 6] } }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "primary.main", letterSpacing: ".04em", textTransform: "uppercase" }}>Week {w.n}</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35, mt: 0.75 }}>{w.t}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, fontWeight: 500 }}>{weekDone(w)} of {w.tasks.length} done</Typography>
                </ButtonBase>
              ))}
            </Box>

            <TableContainer component={Paper} sx={{ border: 1, borderColor: "divider", borderRadius: 4, mb: 2 }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#e6f6f3", "& th": { color: "primary.main", fontWeight: 700, fontSize: 12, letterSpacing: ".04em", textTransform: "uppercase" } }}>
                    <TableCell>Project slice</TableCell>
                    <TableCell>What you produce</TableCell>
                    <TableCell align="right">Week</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {content.plan.project.map((p) => (
                    <TableRow key={p.slice} hover sx={{ "&:last-child td": { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{p.slice}</TableCell>
                      <TableCell>{p.what}</TableCell>
                      <TableCell align="right">{p.week}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              <Button size="small" variant="outlined" color="inherit" sx={{ borderColor: "divider", bgcolor: "#fff" }} onClick={() => setOpenWeeks(new Set(weeks.map((w) => w.n)))}>Expand all weeks</Button>
              <Button size="small" variant="outlined" color="inherit" sx={{ borderColor: "divider", bgcolor: "#fff" }} onClick={() => setOpenWeeks(new Set())}>Collapse all weeks</Button>
              <Button size="small" variant="outlined" color="inherit" sx={{ borderColor: "divider", bgcolor: "#fff" }} onClick={clearTicks}>Clear ticks</Button>
            </Box>

            {weeks.map((w) => (
              <Accordion key={w.n} id={`week${w.n}`} expanded={openWeeks.has(w.n)} onChange={() => setOpenWeeks((s) => flip(s, w.n))} disableGutters elevation={0} sx={accSx}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />} sx={{ px: 2.75, py: 0.75 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 16 }}>4.{w.n} Week {w.n}: {w.t}</Typography>
                    <Typography variant="body2" color="text.secondary">{weekDone(w)} of {w.tasks.length} done</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.75, pb: 2.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    <b style={{ color: "#0f0f14" }}>Hours:</b> {fmt(w.total)} &nbsp; <b style={{ color: "#0f0f14" }}>Deliverable:</b> {w.o}
                  </Typography>
                  {w.tasks.map((t) => (
                    <FormControlLabel
                      key={t.id}
                      sx={{ display: "flex", alignItems: "flex-start", m: 0, mx: -1, px: 1, borderRadius: 2.5, "&:hover": { bgcolor: "#f3fbf9" }, "& .MuiFormControlLabel-label": { pt: 0.9, fontSize: 15, lineHeight: 1.55, color: ticks.has(t.id) ? "text.secondary" : "text.primary", textDecoration: ticks.has(t.id) ? "line-through" : "none" } }}
                      control={<Checkbox checked={ticks.has(t.id)} onChange={(e) => toggleTick(t.id, e.target.checked)} />}
                      label={
                        <span>
                          <Chip size="small" label={fmt(t.hours)} sx={{ bgcolor: "#fef3c7", color: "#b45309", fontWeight: 700, fontSize: 11.5, height: 20, mr: 1 }} />
                          {t.text}
                        </span>
                      }
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, p: 1.75, bgcolor: "#f1f3f2", borderRadius: 3 }} dangerouslySetInnerHTML={html(content.plan.note)} />
          </Box>
        )}

        {/* 5. sources */}
        {tab === 4 && (
          <Box component="section">
            <SectionTitle n={5}>Sources</SectionTitle>
            <Typography sx={lead} dangerouslySetInnerHTML={html(content.sources.lead)} />
            <Box component="ul" sx={{ pl: 2.5, m: 0, "& li": { my: 0.75 }, "& li::marker": { color: "#14b8a6" }, "& a": { color: "primary.main" } }}>
              {content.sources.items.map((s) => (
                <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ mt: 5, mb: 2.5 }} />
        <Typography variant="body2" color="text.secondary" align="center">Made with &lt;3 by Shivam and Claude</Typography>
      </Container>
    </Box>
  );
}
