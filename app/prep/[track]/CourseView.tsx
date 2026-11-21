"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { TrackContent } from "@/lib/track-content";
import AppNav from "../../AppNav";

// A quiet reading layout inside the shared app header: one accent colour, hairline
// dividers, a section list on the left and, on wide screens, a "This week" panel on the
// right. The plan comes first because it is what people come back for every day.

const SECTIONS = [
  { id: "plan", label: "Plan" },
  { id: "concepts", label: "Concepts" },
  { id: "tools", label: "Tools" },
  { id: "jd", label: "What JDs ask" },
  { id: "sources", label: "Sources" },
];
const PLAN = 0;
const CONCEPTS = 1;
const TOOLS = 2;
const JD = 3;
const SOURCES = 4;

const INK = "#171717";
const MUTE = "#666b6a";
const LINE = "#e6e7e6";
const ACCENT = "#0f766e";
const TINT = "#e6f6f3";
const TIER_DOT: Record<string, string> = { t1: ACCENT, t2: "#d97706", t3: "#a3a8a6" };
const TYPE_LABEL: Record<string, string> = { V: "Video", D: "Docs", P: "Paper", A: "Article", C: "Course" };

const html = (h: string) => ({ __html: h });
const fmt = (h: number) => (h % 1 === 0 ? h : h.toFixed(1)) + "h";

const prose = { "& a": { color: ACCENT, textUnderlineOffset: "3px" } } as const;
const overline = { fontSize: 13, fontWeight: 600, color: ACCENT, mb: 0.75 } as const;
const h1sx = { fontSize: { xs: 28, md: 34 }, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: INK, textWrap: "balance" } as const;
const leadSx = { color: MUTE, mt: 1.25, mb: 3.5, maxWidth: "62ch", fontSize: 15.5, lineHeight: 1.7, ...prose } as const;
const h3sx = { fontSize: 15, fontWeight: 700, color: INK, mb: 1.25 } as const;
const flatAcc = {
  bgcolor: "transparent",
  boxShadow: "none",
  borderRadius: "0 !important",
  borderBottom: `1px solid ${LINE}`,
  "&:before": { display: "none" },
  "&.Mui-expanded": { margin: 0 },
} as const;
const cell = { py: 1.5, px: 0, borderColor: LINE, fontSize: 14.5, verticalAlign: "top", color: INK } as const;
const headCell = { py: 1, px: 0, borderColor: LINE, fontSize: 12.5, fontWeight: 600, color: MUTE } as const;
const linkBtn = { fontSize: 13.5, fontWeight: 500, color: MUTE, "&:hover": { color: INK } } as const;
const checkSx = { color: "#b6bbb9", "&.Mui-checked": { color: ACCENT } } as const;

function Dot({ t }: { t: string }) {
  return <Box component="span" sx={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", bgcolor: TIER_DOT[t] ?? TIER_DOT.t3, mr: 1, flex: "none" }} />;
}

export function NumBadge({ n }: { n: number }) {
  return (
    <Box component="span" sx={{ display: "inline-grid", placeItems: "center", width: 26, height: 26, borderRadius: "50%", bgcolor: TINT, color: ACCENT, fontSize: 12.5, fontWeight: 700, flex: "none", fontVariantNumeric: "tabular-nums" }}>
      {n}
    </Box>
  );
}

// Task text says things like "Read concepts 2.1 and 2.2" (section 2 of the original
// write-up). Each reference becomes a link that opens that concept card.
const CONCEPT_REF = /\bconcepts? 2\.\d+(?:(?:, | and )2\.\d+)*/g;

function withConceptLinks(text: string, names: string[], open: (n: number) => void): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(CONCEPT_REF)) {
    out.push(text.slice(last, m.index));
    m[0].replace(/^concepts? /, "").split(/(, | and )/).forEach((part, i) => {
      if (i % 2) return out.push(part);
      const n = Number(part.split(".")[1]);
      if (!names[n - 1]) return out.push(`concept ${part}`);
      out.push(
        <Box
          key={`${m.index}-${i}`}
          component="a"
          href="#concepts"
          title={names[n - 1]}
          onClick={(e: MouseEvent) => {
            // The link sits inside the task's label: stop it from ticking the task.
            e.preventDefault();
            e.stopPropagation();
            open(n);
          }}
          sx={{ color: ACCENT, fontWeight: 500, textDecoration: "underline", textDecorationColor: "#9fd3ca", textUnderlineOffset: "3px", "&:hover": { textDecorationColor: ACCENT } }}
        >
          concept {n}
        </Box>
      );
    });
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

type Week = { n: number; t: string; o: string; total: number; tasks: { id: string; hours: number; text: string }[] };

// What to do now: the first week that still has open tasks, its next few tasks (tickable
// right here), and the whole plan as six small bars.
function ThisWeek({
  weeks,
  ticks,
  onTick,
  onOpenWeek,
  renderText,
}: {
  weeks: Week[];
  ticks: Set<string>;
  onTick: (id: string, on: boolean) => void;
  onOpenWeek: (n: number) => void;
  renderText: (t: string) => ReactNode;
}) {
  const current = weeks.find((w) => w.tasks.some((t) => !ticks.has(t.id))) ?? weeks[weeks.length - 1];
  const done = current.tasks.filter((t) => ticks.has(t.id)).length;
  const left = current.tasks.filter((t) => !ticks.has(t.id));
  const hoursLeft = left.reduce((a, t) => a + t.hours, 0);
  const allDone = weeks.every((w) => w.tasks.every((t) => ticks.has(t.id)));
  const total = weeks.reduce((a, w) => a + w.tasks.length, 0);
  const totalDone = weeks.reduce((a, w) => a + w.tasks.filter((t) => ticks.has(t.id)).length, 0);

  return (
    <Box sx={{ border: `1px solid ${LINE}`, borderRadius: 4, p: 2.5, background: "linear-gradient(180deg, #f3fbf9, #fff 120px)", boxShadow: "0 24px 48px -36px rgba(15,118,110,.45)" }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: ACCENT }}>
        {allDone ? "Plan complete" : `This week · Week ${current.n} of ${weeks.length}`}
      </Typography>
      <Typography sx={{ mt: 0.5, fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3, color: INK }}>
        {allDone ? "All six weeks done. Go get the job." : current.t}
      </Typography>

      {!allDone && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mt: 1.5 }}>
            <LinearProgress variant="determinate" value={(100 * done) / current.tasks.length} sx={{ flex: 1, height: 6, bgcolor: "#d9f0ec", "& .MuiLinearProgress-bar": { bgcolor: ACCENT } }} />
            <Typography sx={{ fontSize: 12.5, color: MUTE, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
              {done}/{current.tasks.length} · {fmt(hoursLeft)} left
            </Typography>
          </Box>

          <Typography sx={{ mt: 2.25, mb: 0.5, fontSize: 12.5, fontWeight: 600, color: MUTE }}>Next up</Typography>
          {left.slice(0, 3).map((t) => (
            <FormControlLabel
              key={t.id}
              sx={{ display: "flex", alignItems: "flex-start", m: 0, ml: -1.1, "& .MuiFormControlLabel-label": { flex: 1, pt: 0.85, fontSize: 14, lineHeight: 1.5, color: INK } }}
              control={<Checkbox size="small" checked={false} onChange={(e) => onTick(t.id, e.target.checked)} sx={checkSx} />}
              label={renderText(t.text)}
            />
          ))}
          <Button size="small" onClick={() => onOpenWeek(current.n)} sx={{ mt: 1, ml: -0.75, color: ACCENT, fontWeight: 600, "&:hover": { transform: "none", bgcolor: TINT } }}>
            Open week {current.n}
          </Button>
        </>
      )}

      <Divider sx={{ my: 2, borderColor: LINE }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: MUTE }}>Whole plan</Typography>
        <Typography sx={{ fontSize: 12.5, color: MUTE, fontVariantNumeric: "tabular-nums" }}>{totalDone} of {total} tasks</Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${weeks.length}, 1fr)`, gap: 0.5 }}>
        {weeks.map((w) => {
          const d = w.tasks.filter((t) => ticks.has(t.id)).length;
          return (
            <ButtonBase key={w.n} onClick={() => onOpenWeek(w.n)} aria-label={`Week ${w.n}: ${d} of ${w.tasks.length} done`} title={`Week ${w.n}: ${w.t}`} sx={{ display: "block", py: 0.75 }}>
              <LinearProgress variant="determinate" value={(100 * d) / w.tasks.length} sx={{ height: 6, bgcolor: "#d9f0ec", "& .MuiLinearProgress-bar": { bgcolor: ACCENT } }} />
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

export default function CourseView({
  content,
  greeting,
  greetingName,
  trackId,
  trackTitle,
  joined,
  initialTicks,
}: {
  content: TrackContent;
  greeting?: string;
  greetingName?: string;
  trackId: string;
  trackTitle?: string;
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

  // Clearing is one click, so it can be undone for a few seconds.
  const [undo, setUndo] = useState<Set<string> | null>(null);
  const clearTicks = () => {
    if (ticks.size === 0) return;
    setUndo(ticks);
    setTicks(new Set());
    scheduleSave();
  };
  const restoreTicks = () => {
    if (undo) setTicks(undo);
    setUndo(null);
    scheduleSave();
  };

  // ----- derived plan data -----
  const weeks = useMemo<Week[]>(
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
  const weekDone = (w: Week) => w.tasks.filter((t) => ticks.has(t.id)).length;
  const conceptNames = useMemo(() => content.concepts.map((c) => c.t), [content.concepts]);

  // ----- sections (kept in the URL hash) and open/closed rows -----
  const [tab, setTab] = useState(PLAN);
  useEffect(() => {
    const i = SECTIONS.findIndex((t) => t.id === location.hash.slice(1));
    if (i >= 0) setTab(i);
  }, []);
  const showTab = (i: number) => {
    setTab(i);
    try { history.replaceState(null, "", "#" + SECTIONS[i].id); } catch { /* ignore */ }
  };
  const go = (i: number) => {
    showTab(i);
    window.scrollTo({ top: 0 });
  };
  const scrollToId = (id: string) => setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "smooth" }), 60);

  const [openConcepts, setOpenConcepts] = useState<Set<number>>(new Set([0]));
  // The week that is open by default is the first one with tasks left.
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(() => {
    const t = new Set(initialTicks);
    const w = content.weeks.find((wk) => wk.tasks.some((_, ti) => !t.has(`w${wk.n}t${ti}`)));
    return new Set([w?.n ?? 1]);
  });
  const flip = (set: Set<number>, k: number) => {
    const n = new Set(set);
    if (n.has(k)) n.delete(k); else n.add(k);
    return n;
  };
  const openConcept = (n: number) => {
    showTab(CONCEPTS);
    setOpenConcepts((s) => new Set(s).add(n - 1));
    scrollToId(`c${n}`);
  };
  const openWeek = (n: number) => {
    showTab(PLAN);
    setOpenWeeks((s) => new Set(s).add(n));
    scrollToId(`week${n}`);
  };
  const taskText = (t: string) => withConceptLinks(t, conceptNames, openConcept);

  const thisWeek = <ThisWeek weeks={weeks} ticks={ticks} onTick={toggleTick} onOpenWeek={openWeek} renderText={taskText} />;
  const pct = allIds.length ? (100 * doneCount) / allIds.length : 0;

  // Greeting: one line at the top of the plan, name in the accent colour.
  const gAt = greeting && greetingName ? greeting.indexOf(greetingName) : -1;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff", color: INK }}>
      <AppNav
        left={
          <Select
            size="small"
            value={trackId}
            onChange={(e) => router.push(e.target.value === "__manage" ? "/tracks" : `/prep/${e.target.value}`)}
            variant="standard"
            disableUnderline
            sx={{ fontWeight: 600, fontSize: 14, maxWidth: { xs: 150, sm: 240 }, color: INK }}
            inputProps={{ "aria-label": "Switch track" }}
          >
            {joined.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>
            ))}
            <Divider />
            <MenuItem value="__manage">Add or manage tracks...</MenuItem>
          </Select>
        }
        right={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Typography aria-live="polite" sx={{ fontSize: 12, color: MUTE, display: { xs: "none", md: "block" } }}>{status}</Typography>
            <Typography sx={{ fontSize: 13, color: MUTE, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", display: { xs: "none", sm: "block" } }}>
              {doneCount} of {allIds.length} tasks
            </Typography>
            <LinearProgress variant="determinate" value={pct} aria-label={`${doneCount} of ${allIds.length} tasks done`} sx={{ width: { xs: 56, sm: 110 }, height: 6, bgcolor: "#d9f0ec", "& .MuiLinearProgress-bar": { bgcolor: ACCENT } }} />
          </Box>
        }
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 6 }, pb: 10 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "170px minmax(0,1fr)", lg: "170px minmax(0,1fr) 290px" }, columnGap: { md: 6 } }}>
          {/* section list */}
          <Box component="nav" aria-label="Sections" sx={{ display: { xs: "none", md: "block" }, position: "sticky", top: 96, alignSelf: "start" }}>
            {SECTIONS.map((s, i) => (
              <ButtonBase
                key={s.id}
                onClick={() => go(i)}
                aria-current={tab === i ? "page" : undefined}
                sx={{ display: "block", width: "100%", textAlign: "left", py: 0.9, pl: 1.75, fontSize: 14, fontWeight: tab === i ? 600 : 400, color: tab === i ? INK : MUTE, borderLeft: `2px solid ${tab === i ? ACCENT : LINE}`, "&:hover": { color: INK } }}
              >
                {s.label}
              </ButtonBase>
            ))}
          </Box>

          <Box sx={{ minWidth: 0, maxWidth: 720 }}>
            <Box sx={{ display: { xs: "block", md: "none" }, mx: -2, mb: 3, borderBottom: `1px solid ${LINE}` }}>
              <Tabs value={tab} onChange={(_, v) => go(v)} variant="scrollable" scrollButtons={false} sx={{ minHeight: 40, "& .MuiTabs-indicator": { bgcolor: ACCENT, height: 2 }, "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: 14, minHeight: 40, color: MUTE }, "& .Mui-selected": { color: `${INK} !important`, fontWeight: 600 } }}>
                {SECTIONS.map((s) => (
                  <Tab key={s.id} label={s.label} disableRipple />
                ))}
              </Tabs>
            </Box>

            {/* plan */}
            {tab === PLAN && (
              <Box component="section">
                {greeting && (
                  <Typography sx={{ fontSize: 15, color: MUTE, mb: 1.5, animation: "cv-in .6s ease both", "@keyframes cv-in": { from: { opacity: 0, transform: "translateY(4px)" } } }}>
                    {gAt >= 0 ? (
                      <>
                        {greeting.slice(0, gAt)}
                        <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>{greetingName}</Box>
                        {greeting.slice(gAt + (greetingName?.length ?? 0))}
                      </>
                    ) : greeting}
                  </Typography>
                )}
                <Typography sx={overline}>{trackTitle} track</Typography>
                <Typography component="h1" sx={h1sx}>Your 6-week plan</Typography>
                <Typography sx={leadSx} dangerouslySetInnerHTML={html(content.plan.lead)} />

                <Box sx={{ display: { lg: "none" }, mb: 4.5 }}>{thisWeek}</Box>

                <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1 }}>
                  <Typography sx={{ ...h3sx, mb: 0 }}>Weeks</Typography>
                  <Box sx={{ display: "flex", gap: 2.5 }}>
                    <ButtonBase sx={linkBtn} onClick={() => setOpenWeeks(new Set(weeks.map((w) => w.n)))}>Expand all</ButtonBase>
                    <ButtonBase sx={linkBtn} onClick={() => setOpenWeeks(new Set())}>Collapse all</ButtonBase>
                  </Box>
                </Box>
                <Box sx={{ borderTop: `1px solid ${LINE}` }}>
                  {weeks.map((w) => {
                    const d = weekDone(w);
                    const full = d === w.tasks.length;
                    return (
                      <Accordion key={w.n} id={`week${w.n}`} expanded={openWeeks.has(w.n)} onChange={() => setOpenWeeks((s) => flip(s, w.n))} disableGutters elevation={0} sx={flatAcc}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: MUTE }} />} sx={{ px: 0, py: 0.5, "& .MuiAccordionSummary-content": { my: 1.5, alignItems: "center", gap: 2 } }}>
                          <Typography sx={{ width: 56, flex: "none", fontSize: 13, color: full ? ACCENT : MUTE, fontWeight: full ? 600 : 400 }}>Week {w.n}</Typography>
                          <Typography sx={{ fontWeight: 600, fontSize: 15.5, flex: 1, minWidth: 0 }}>{w.t}</Typography>
                          <Box sx={{ display: { xs: "none", sm: "block" }, width: 64, flex: "none" }}>
                            <LinearProgress variant="determinate" value={(100 * d) / w.tasks.length} sx={{ height: 4, bgcolor: "#e6e7e6", "& .MuiLinearProgress-bar": { bgcolor: ACCENT } }} />
                          </Box>
                          <Typography sx={{ fontSize: 13, color: MUTE, fontVariantNumeric: "tabular-nums", pr: 1, minWidth: 28, textAlign: "right" }}>{d}/{w.tasks.length}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 0, pt: 0, pb: 2.5 }}>
                          <Typography sx={{ fontSize: 14, color: MUTE, mb: 1.25, lineHeight: 1.6 }}>
                            {fmt(w.total)} in total. Deliverable: {w.o}
                          </Typography>
                          {w.tasks.map((t) => (
                            <FormControlLabel
                              key={t.id}
                              sx={{ display: "flex", alignItems: "flex-start", m: 0, ml: -1.1, "& .MuiFormControlLabel-label": { flex: 1, pt: 0.9, fontSize: 15, lineHeight: 1.55, color: ticks.has(t.id) ? MUTE : INK } }}
                              control={<Checkbox size="small" checked={ticks.has(t.id)} onChange={(e) => toggleTick(t.id, e.target.checked)} sx={checkSx} />}
                              label={
                                <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
                                  <Box component="span" sx={{ textDecoration: ticks.has(t.id) ? "line-through" : "none", textDecorationColor: "#b6bbb9" }}>{taskText(t.text)}</Box>
                                  <Box component="span" sx={{ color: MUTE, fontSize: 13, fontVariantNumeric: "tabular-nums", flex: "none" }}>{fmt(t.hours)}</Box>
                                </Box>
                              }
                            />
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
                <Typography sx={{ mt: 2.5, color: MUTE, fontSize: 13.5, lineHeight: 1.65 }} dangerouslySetInnerHTML={html(content.plan.note)} />

                <Typography sx={{ ...h3sx, mt: 5 }}>The project, slice by slice</Typography>
                <Table size="small">
                  <TableBody>
                    {content.plan.project.map((p) => (
                      <TableRow key={p.slice} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={{ ...cell, fontWeight: 600, width: "26%", pr: 3 }}>{p.slice}</TableCell>
                        <TableCell sx={{ ...cell, color: MUTE }}>{p.what}</TableCell>
                        <TableCell sx={{ ...cell, width: 70, color: MUTE, whiteSpace: "nowrap" }} align="right">Wk {p.week}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Box sx={{ mt: 5, display: "flex", alignItems: "center", gap: 1 }}>
                  <ButtonBase onClick={clearTicks} disabled={ticks.size === 0} sx={{ ...linkBtn, fontSize: 13, "&:hover": { color: "#b42318" }, "&.Mui-disabled": { opacity: 0.45 } }}>
                    Reset all progress in this track
                  </ButtonBase>
                </Box>
              </Box>
            )}

            {/* concepts */}
            {tab === CONCEPTS && (
              <Box component="section">
                <Typography sx={overline}>{trackTitle} track</Typography>
                <Typography component="h1" sx={h1sx}>Concepts at interview depth</Typography>
                <Typography sx={leadSx} dangerouslySetInnerHTML={html(content.conceptsLead)} />
                <Box sx={{ display: "flex", gap: 2.5, mb: 1.5 }}>
                  <ButtonBase sx={linkBtn} onClick={() => setOpenConcepts(new Set(content.concepts.map((_, i) => i)))}>Expand all</ButtonBase>
                  <ButtonBase sx={linkBtn} onClick={() => setOpenConcepts(new Set())}>Collapse all</ButtonBase>
                </Box>
                <Box sx={{ borderTop: `1px solid ${LINE}` }}>
                  {content.concepts.map((c, k) => {
                    const rs = content.res[k] ?? [];
                    return (
                      <Accordion key={c.t} id={`c${k + 1}`} expanded={openConcepts.has(k)} onChange={() => setOpenConcepts((s) => flip(s, k))} disableGutters elevation={0} slotProps={{ transition: { unmountOnExit: true } }} sx={flatAcc}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: MUTE }} />} sx={{ px: 0, py: 0.5, "& .MuiAccordionSummary-content": { my: 1.5, gap: 1.75, alignItems: "flex-start" } }}>
                          <NumBadge n={k + 1} />
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: 16, lineHeight: 1.4 }}>{c.t}</Typography>
                            <Typography sx={{ color: MUTE, fontSize: 13.5, mt: 0.25 }}>{c.s}</Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 0, pt: 0, pb: 3, pl: { sm: 5.5 } }}>
                          {c.subs.map((s) => (
                            <Box key={s.h} sx={{ mt: 2 }}>
                              <Typography sx={h3sx}>{s.h}</Typography>
                              <Box component="ul" sx={{ m: 0, pl: 2.5, color: INK, fontSize: 15, lineHeight: 1.7, "& li": { my: 0.75 }, "& li::marker": { color: "#a3a8a6" }, ...prose }}>
                                {s.l.map((li, i) => (
                                  <li key={i} dangerouslySetInnerHTML={html(li)} />
                                ))}
                              </Box>
                            </Box>
                          ))}
                          <Box sx={{ mt: 2.75, p: 2, borderRadius: 3, bgcolor: "#f3fbf9", borderLeft: `3px solid ${ACCENT}` }}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: ACCENT, mb: 0.5 }}>Say in an interview</Typography>
                            <Typography sx={{ fontSize: 15, lineHeight: 1.65 }} dangerouslySetInnerHTML={html(c.say)} />
                          </Box>
                          {rs.length > 0 && (
                            <Box sx={{ mt: 2.75 }}>
                              <Typography sx={h3sx}>Study material</Typography>
                              <Box sx={{ display: "grid", gap: 0.9 }}>
                                {rs.map((r) => (
                                  <Box key={r.url + r.title} sx={{ display: "flex", gap: 2, alignItems: "baseline", fontSize: 14.5, lineHeight: 1.6 }}>
                                    <Typography component="span" sx={{ width: 56, flex: "none", fontSize: 12.5, color: MUTE }}>{TYPE_LABEL[r.type] ?? r.type}</Typography>
                                    <span>
                                      <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>{r.title}</a>
                                      <Box component="span" sx={{ color: MUTE }}> - {r.why}</Box>
                                    </span>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* tools */}
            {tab === TOOLS && (
              <Box component="section">
                <Typography sx={overline}>{trackTitle} track</Typography>
                <Typography component="h1" sx={h1sx}>Tools: one line each</Typography>
                <Typography sx={leadSx} dangerouslySetInnerHTML={html(content.toolsLead)} />
                {content.tools.map((g) => (
                  <Box key={g.group} sx={{ mb: 4 }}>
                    <Typography sx={h3sx}>{g.group}</Typography>
                    <Table size="small">
                      <TableBody>
                        {g.items.map((it) => {
                          const link = (content.toolLinks as Record<string, string>)[it.name];
                          return (
                            <TableRow key={it.name} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                              <TableCell sx={{ ...cell, fontWeight: 600, width: "32%", pr: 3 }}>
                                {link ? <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>{it.name}</a> : it.name}
                              </TableCell>
                              <TableCell sx={{ ...cell, color: MUTE, pr: 2 }}>{it.what}</TableCell>
                              <TableCell sx={{ ...cell, width: 90, color: MUTE, whiteSpace: "nowrap" }}>
                                <Box sx={{ display: "inline-flex", alignItems: "center" }}><Dot t={it.tier} />{it.depth}</Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                ))}
              </Box>
            )}

            {/* what JDs ask, with the track's introduction */}
            {tab === JD && (
              <Box component="section">
                <Typography sx={overline}>{trackTitle} track</Typography>
                <Typography component="h1" sx={h1sx}>{content.hero.h1}</Typography>
                <Typography sx={{ ...leadSx, mb: 1.5 }}>{content.hero.p}</Typography>
                <Typography sx={{ color: MUTE, fontSize: 13.5, mb: 5 }}>{content.hero.chips.join("  ·  ")}</Typography>

                <Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: INK }}>What job descriptions actually ask for</Typography>
                <Typography sx={leadSx} dangerouslySetInnerHTML={html(content.jd.lead)} />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...headCell, width: 150, pr: 2.5 }}>Tier</TableCell>
                      <TableCell sx={{ ...headCell, width: "40%", pr: 3 }}>Skill or tool</TableCell>
                      <TableCell sx={headCell}>Where it shows up</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {content.jd.rows.map((r) => (
                      <TableRow key={r.name} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={{ ...cell, color: MUTE, pr: 2.5 }}>
                          <Box sx={{ display: "flex", alignItems: "baseline" }}><Dot t={r.tier} /><span>{r.tierLabel}</span></Box>
                        </TableCell>
                        <TableCell sx={{ ...cell, fontWeight: 600, pr: 3 }}>{r.name}</TableCell>
                        <TableCell sx={{ ...cell, color: MUTE, ...prose }} dangerouslySetInnerHTML={html(r.where)} />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Typography sx={{ mt: 2.5, color: MUTE, fontSize: 13.5, lineHeight: 1.65, ...prose }} dangerouslySetInnerHTML={html(content.jd.note)} />
              </Box>
            )}

            {/* sources */}
            {tab === SOURCES && (
              <Box component="section">
                <Typography sx={overline}>{trackTitle} track</Typography>
                <Typography component="h1" sx={h1sx}>Sources</Typography>
                <Typography sx={leadSx} dangerouslySetInnerHTML={html(content.sources.lead)} />
                <Box component="ul" sx={{ pl: 2.5, m: 0, fontSize: 14.5, lineHeight: 1.7, "& li": { my: 0.75 }, "& li::marker": { color: "#a3a8a6" }, ...prose }}>
                  {content.sources.items.map((s) => (
                    <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>
                  ))}
                </Box>
              </Box>
            )}

            <Typography sx={{ mt: 8, pt: 2.5, borderTop: `1px solid ${LINE}`, color: MUTE, fontSize: 13 }}>
              Made with &lt;3 by Shivam and Claude
            </Typography>
          </Box>

          {/* this week, always in view on wide screens */}
          <Box component="aside" aria-label="This week" sx={{ display: { xs: "none", lg: "block" }, position: "sticky", top: 96, alignSelf: "start" }}>
            {thisWeek}
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={undo !== null}
        autoHideDuration={8000}
        onClose={(_, reason) => { if (reason !== "clickaway") setUndo(null); }}
        message="Progress in this track was reset."
        action={<Button size="small" onClick={restoreTicks} sx={{ color: "#5eead4", fontWeight: 700, "&:hover": { transform: "none" } }}>Undo</Button>}
      />
    </Box>
  );
}
