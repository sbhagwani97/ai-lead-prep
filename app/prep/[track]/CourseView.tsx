"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
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

// A quiet reading layout: one accent colour, hairline dividers instead of cards,
// plain type, and a section list on the left.

const SECTIONS = [
  { id: "jd", label: "What JDs ask" },
  { id: "concepts", label: "Concepts" },
  { id: "tools", label: "Tools" },
  { id: "plan", label: "6-week plan" },
  { id: "sources", label: "Sources" },
];

const INK = "#171717";
const MUTE = "#666b6a";
const LINE = "#e6e7e6";
const ACCENT = "#0f766e";
const TIER_DOT: Record<string, string> = { t1: ACCENT, t2: "#d97706", t3: "#a3a8a6" };
const TYPE_LABEL: Record<string, string> = { V: "Video", D: "Docs", P: "Paper", A: "Article", C: "Course" };

const html = (h: string) => ({ __html: h });
const fmt = (h: number) => (h % 1 === 0 ? h : h.toFixed(1)) + "h";

const prose = { "& a": { color: ACCENT, textUnderlineOffset: "3px" } } as const;
const h2sx = { fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: INK } as const;
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

function Dot({ t }: { t: string }) {
  return <Box component="span" sx={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", bgcolor: TIER_DOT[t] ?? TIER_DOT.t3, mr: 1, flex: "none" }} />;
}

export default function CourseView({
  content,
  greeting,
  trackId,
  joined,
  initialTicks,
}: {
  content: TrackContent;
  greeting?: string;
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

  // ----- sections (kept in the URL hash) and open/closed rows -----
  const [tab, setTab] = useState(0);
  useEffect(() => {
    const i = SECTIONS.findIndex((t) => t.id === location.hash.slice(1));
    if (i >= 0) setTab(i);
  }, []);
  const go = (i: number) => {
    setTab(i);
    try { history.replaceState(null, "", "#" + SECTIONS[i].id); } catch { /* ignore */ }
    window.scrollTo({ top: 0 });
  };
  const [openConcepts, setOpenConcepts] = useState<Set<number>>(new Set([0]));
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]));
  const flip = (set: Set<number>, k: number) => {
    const n = new Set(set);
    if (n.has(k)) n.delete(k); else n.add(k);
    return n;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff", color: INK }}>
      {/* top bar */}
      <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 50, bgcolor: "#fff", borderBottom: `1px solid ${LINE}` }}>
        <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", gap: 2, minHeight: 56, flexWrap: "wrap", py: { xs: 1, sm: 0 } }}>
          <Link href="/prep" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: INK, textDecoration: "none" }}>
            <img src="/logo-mark.svg" alt="" width={24} height={24} />
            Preppy
          </Link>
          <Select
            size="small"
            value={trackId}
            onChange={(e) => router.push(e.target.value === "__manage" ? "/tracks" : `/prep/${e.target.value}`)}
            variant="standard"
            disableUnderline
            sx={{ fontWeight: 600, fontSize: 14, maxWidth: 220, color: INK }}
            inputProps={{ "aria-label": "Switch track" }}
          >
            {joined.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>
            ))}
            <Divider />
            <MenuItem value="__manage">Add or manage tracks...</MenuItem>
          </Select>
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.75 }}>
            <Typography sx={{ fontSize: 13, color: MUTE, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
              {doneCount} of {allIds.length} tasks
            </Typography>
            <LinearProgress variant="determinate" value={allIds.length ? (100 * doneCount) / allIds.length : 0} sx={{ width: { xs: 64, sm: 120 }, height: 4, bgcolor: "#e6e7e6", "& .MuiLinearProgress-bar": { bgcolor: ACCENT } }} />
            <Typography aria-live="polite" sx={{ fontSize: 12, color: MUTE, minWidth: 48, display: { xs: "none", md: "block" } }}>{status}</Typography>
            <Link href="/account" style={{ fontSize: 13.5, fontWeight: 500, color: INK, textDecoration: "none" }}>Account</Link>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: 10 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "190px minmax(0,1fr)" }, columnGap: 8 }}>
          {/* section list */}
          <Box component="nav" aria-label="Sections" sx={{ display: { xs: "none", md: "block" }, position: "sticky", top: 88, alignSelf: "start" }}>
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

          <Box sx={{ minWidth: 0, maxWidth: 780 }}>
            <Box sx={{ display: { xs: "block", md: "none" }, mx: -2, mb: 3, borderBottom: `1px solid ${LINE}` }}>
              <Tabs value={tab} onChange={(_, v) => go(v)} variant="scrollable" scrollButtons={false} sx={{ minHeight: 40, "& .MuiTabs-indicator": { bgcolor: ACCENT, height: 2 }, "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: 14, minHeight: 40, color: MUTE }, "& .Mui-selected": { color: `${INK} !important`, fontWeight: 600 } }}>
                {SECTIONS.map((s) => (
                  <Tab key={s.id} label={s.label} disableRipple />
                ))}
              </Tabs>
            </Box>

            {/* title block, shown once at the top of every section */}
            <Box sx={{ mb: 5 }}>
              {greeting && (
                <Typography sx={{ mb: 1.5, fontSize: 14.5, fontWeight: 600, color: ACCENT }}>{greeting}</Typography>
              )}
              <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.12, color: INK, maxWidth: "22ch", textWrap: "balance" }}>
                {content.hero.h1}
              </Typography>
              <Typography sx={{ mt: 1.75, color: MUTE, fontSize: 16, lineHeight: 1.7, maxWidth: "62ch" }}>{content.hero.p}</Typography>
              <Typography sx={{ mt: 1.75, color: MUTE, fontSize: 13.5 }}>{content.hero.chips.join("  ·  ")}</Typography>
            </Box>

            {/* what JDs ask */}
            {tab === 0 && (
              <Box component="section">
                <Typography variant="h2" sx={h2sx}>What job descriptions actually ask for</Typography>
                <Typography sx={leadSx} dangerouslySetInnerHTML={html(content.jd.lead)} />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...headCell, width: 150 }}>Tier</TableCell>
                      <TableCell sx={{ ...headCell, width: "42%", pr: 3 }}>Skill or tool</TableCell>
                      <TableCell sx={headCell}>Where it shows up</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {content.jd.rows.map((r) => (
                      <TableRow key={r.name} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={{ ...cell, whiteSpace: "nowrap", color: MUTE }}>
                          <Box sx={{ display: "inline-flex", alignItems: "center" }}><Dot t={r.tier} />{r.tierLabel}</Box>
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

            {/* concepts */}
            {tab === 1 && (
              <Box component="section">
                <Typography variant="h2" sx={h2sx}>Concepts at interview depth</Typography>
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
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: MUTE }} />} sx={{ px: 0, py: 0.5, "& .MuiAccordionSummary-content": { my: 1.5 } }}>
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{c.t}</Typography>
                            <Typography sx={{ color: MUTE, fontSize: 13.5, mt: 0.25 }}>{c.s}</Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 0, pt: 0, pb: 3 }}>
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
                          <Box sx={{ mt: 2.75, pl: 2, borderLeft: `3px solid ${ACCENT}` }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: MUTE, mb: 0.25 }}>Say in an interview</Typography>
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
            {tab === 2 && (
              <Box component="section">
                <Typography variant="h2" sx={h2sx}>Tools: one line each</Typography>
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
                              <TableCell sx={{ ...cell, color: MUTE }}>{it.what}</TableCell>
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

            {/* plan */}
            {tab === 3 && (
              <Box component="section">
                <Typography variant="h2" sx={h2sx}>6-week plan</Typography>
                <Typography sx={leadSx} dangerouslySetInnerHTML={html(content.plan.lead)} />

                <Typography sx={h3sx}>Project</Typography>
                <Table size="small" sx={{ mb: 4 }}>
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

                <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1 }}>
                  <Typography sx={{ ...h3sx, mb: 0 }}>Weeks</Typography>
                  <Box sx={{ display: "flex", gap: 2.5 }}>
                    <ButtonBase sx={linkBtn} onClick={() => setOpenWeeks(new Set(weeks.map((w) => w.n)))}>Expand all</ButtonBase>
                    <ButtonBase sx={linkBtn} onClick={() => setOpenWeeks(new Set())}>Collapse all</ButtonBase>
                    <ButtonBase sx={linkBtn} onClick={clearTicks}>Clear ticks</ButtonBase>
                  </Box>
                </Box>
                <Box sx={{ borderTop: `1px solid ${LINE}` }}>
                  {weeks.map((w) => {
                    const d = weekDone(w);
                    return (
                      <Accordion key={w.n} id={`week${w.n}`} expanded={openWeeks.has(w.n)} onChange={() => setOpenWeeks((s) => flip(s, w.n))} disableGutters elevation={0} sx={flatAcc}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: MUTE }} />} sx={{ px: 0, py: 0.5, "& .MuiAccordionSummary-content": { my: 1.5, alignItems: "center", gap: 2 } }}>
                          <Typography sx={{ width: 56, flex: "none", fontSize: 13, color: MUTE }}>Week {w.n}</Typography>
                          <Typography sx={{ fontWeight: 600, fontSize: 15.5, flex: 1 }}>{w.t}</Typography>
                          <Typography sx={{ fontSize: 13, color: MUTE, fontVariantNumeric: "tabular-nums", pr: 1 }}>{d}/{w.tasks.length}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 0, pt: 0, pb: 2.5 }}>
                          <Typography sx={{ fontSize: 14, color: MUTE, mb: 1.25, lineHeight: 1.6 }}>
                            {fmt(w.total)} in total. Deliverable: {w.o}
                          </Typography>
                          {w.tasks.map((t) => (
                            <FormControlLabel
                              key={t.id}
                              sx={{ display: "flex", alignItems: "flex-start", m: 0, ml: -1.1, "& .MuiFormControlLabel-label": { flex: 1, pt: 0.9, fontSize: 15, lineHeight: 1.55, color: ticks.has(t.id) ? MUTE : INK } }}
                              control={<Checkbox size="small" checked={ticks.has(t.id)} onChange={(e) => toggleTick(t.id, e.target.checked)} sx={{ color: "#b6bbb9", "&.Mui-checked": { color: ACCENT } }} />}
                              label={
                                <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
                                  <Box component="span" sx={{ textDecoration: ticks.has(t.id) ? "line-through" : "none", textDecorationColor: "#b6bbb9" }}>{t.text}</Box>
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
              </Box>
            )}

            {/* sources */}
            {tab === 4 && (
              <Box component="section">
                <Typography variant="h2" sx={h2sx}>Sources</Typography>
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
        </Box>
      </Container>
    </Box>
  );
}
