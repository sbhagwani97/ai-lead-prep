"use client";

import Link from "next/link";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import type { Track } from "@/lib/tracks";
import HeroDemo from "./HeroDemo";
import StoryCard, { type StoryWeek } from "./StoryCard";

const STEPS = [
  { t: "Pick your tracks", d: "Choose the role you are preparing for. Follow one, or several, and change your mind any time." },
  { t: "Follow a 6-week plan", d: "Every track is a week-by-week plan with the concepts, tools and study links that interviews actually probe." },
  { t: "Tick it off, anywhere", d: "Your progress is saved to your account, so it follows you from laptop to phone and back." },
];

const WEEKS: StoryWeek[] = [
  { t: "Foundations and RAG basics", tasks: ["Read the LLM concepts", "Lab: structured output", "Set up pgvector", "Build RAG v1 with citations"] },
  { t: "RAG in depth", tasks: ["Hybrid search and reranking", "Choose a vector database", "Chunking experiments", "Write the failure log"] },
  { t: "Agents and orchestration", tasks: ["Tool-calling loop lab", "LangGraph agent with approvals", "Trace it in LangSmith", "Agent design review"] },
  { t: "MCP, A2A and evals", tasks: ["Build an MCP tool server", "Draft a 30-question golden set", "Score it with RAGAS", "Add the eval to CI"] },
  { t: "LLMOps and serving", tasks: ["Gateway with fallback", "Cost and token accounting", "Guardrails on input and output", "Sketch the serving plan"] },
  { t: "Leadership and mocks", tasks: ["Security and governance review", "Build vs buy write-up", "System-design drills", "Two mock interviews"] },
];

const wrapSx = { py: { xs: 9, md: 14 } } as const;
const eyebrow = { bgcolor: "#e6f6f3", color: "primary.main", border: 0 } as const;
const h2 = { fontSize: "clamp(28px, 3.8vw, 44px)", textWrap: "balance" } as const;
const mockSx = { p: 2, display: "grid", gap: 1.25, borderRadius: 4, border: 1, borderColor: "divider", bgcolor: "#fafbfa", boxShadow: "0 30px 50px -36px rgba(15,118,110,.4)" } as const;

function Logo({ size = 26 }: { size?: number }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1.1, fontWeight: 700, fontSize: size > 24 ? 18 : 15, letterSpacing: "-0.02em" }}>
      <img src="/logo-mark.svg" alt="" width={size} height={size} />
      Preppy
    </Box>
  );
}

export default function LandingView({ tracks }: { tracks: Track[] }) {
  const first = tracks[0];
  return (
    <Box sx={{ overflowX: "clip" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: "rgba(251,251,255,.82)", backdropFilter: "saturate(1.4) blur(12px)", borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 64, gap: 3 }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}><Logo /></Link>
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, ml: 1 }}>
              {[["How it works", "#how"], ["Inside a track", "#inside"], ["Tracks", "#tracks"]].map(([l, h]) => (
                <Button key={h} href={h} color="inherit" sx={{ color: "text.secondary", "&:hover": { transform: "none", color: "text.primary" } }}>{l}</Button>
              ))}
            </Box>
            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
              <Button component={Link} href="/sign-in" color="inherit" sx={{ display: { xs: "none", sm: "inline-flex" } }}>Sign in</Button>
              <Button component={Link} href="/sign-up" variant="contained">Get started</Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <main>
        {/* HERO */}
        <Box sx={{ position: "relative", py: { xs: 6, md: 10 }, minHeight: { md: "calc(100vh - 64px)" }, display: "flex", alignItems: "center", background: "radial-gradient(40% 50% at 75% 25%, rgba(20,184,166,.2), transparent 70%), radial-gradient(30% 40% at 15% 65%, rgba(20,184,166,.15), transparent 70%)" }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" }, gap: { xs: 5, md: 7 }, alignItems: "center" }}>
              <Box>
                <Chip label="Interview prep, track by track" size="small" sx={eyebrow} />
                <Typography variant="h1" sx={{ mt: 2.25, fontSize: "clamp(38px, 5.6vw, 64px)", textWrap: "balance" }}>
                  Prep for the AI job you{" "}
                  <Box component="span" sx={{ background: "linear-gradient(100deg,#0f766e,#14b8a6)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>actually</Box> want.
                </Typography>
                <Typography sx={{ mt: 2.5, maxWidth: "52ch", fontSize: 18, lineHeight: 1.6, color: "text.secondary" }}>
                  Preppy turns what job descriptions ask for into a focused 6-week plan: the concepts, the tools, and a project to show for it. No tutorials, no filler.
                </Typography>
                <Box sx={{ mt: 4, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  <Button component={Link} href="/sign-up" variant="contained" size="large">Start preparing</Button>
                  <Button href="#how" variant="outlined" color="inherit" size="large" sx={{ borderColor: "divider" }}>See how it works</Button>
                </Box>
              </Box>
              <HeroDemo track={first?.title ?? "AI Lead"} />
            </Box>
          </Container>
        </Box>

        {/* FACTS */}
        <Box sx={{ borderTop: 1, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(4,1fr)" }, textAlign: "center" }}>
              {[["6", "week plans"], ["150", "focused hours per track"], [String(tracks.length), "tracks, more coming"], ["Any", "device, progress synced"]].map(([b, s]) => (
                <Box key={s} sx={{ py: 3.5, px: 1 }}>
                  <Typography sx={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", color: "primary.main" }}>{b}</Typography>
                  <Typography variant="body2" color="text.secondary">{s}</Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* HOW */}
        <Box id="how" sx={wrapSx}>
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: 640, mb: 7 }}>
              <Chip label="How it works" size="small" sx={eyebrow} />
              <Typography variant="h2" sx={{ ...h2, mt: 1.75 }}>Three steps. Then you just show up.</Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" }, gap: 2.5 }}>
              {STEPS.map((s, i) => (
                <Card key={s.t} sx={{ transition: "transform .25s ease, box-shadow .25s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 20px 40px -24px rgba(15,118,110,.4)" } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Avatar variant="rounded" sx={{ bgcolor: "primary.main", width: 40, height: 40, fontSize: 14, fontWeight: 700, borderRadius: 3 }}>0{i + 1}</Avatar>
                    <Typography variant="h6" sx={{ mt: 2.25 }}>{s.t}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>{s.d}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Container>
        </Box>

        {/* THE ONE SCROLL-DRIVEN COMPONENT */}
        <StoryCard weeks={WEEKS} track={first?.title ?? "AI Lead"} />

        {/* INSIDE */}
        <Box id="inside" sx={{ ...wrapSx, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: 640, mb: 7 }}>
              <Chip label="Inside a track" size="small" sx={eyebrow} />
              <Typography variant="h2" sx={{ ...h2, mt: 1.75 }}>Everything at interview depth, nothing else.</Typography>
            </Box>

            {[
              { t: "Concepts with a line you can say out loud", d: "Each card has the few points interviewers probe, study links, and a sentence to practise.", flip: false, v: "acc" },
              { t: "Tools, ranked by how deep to go", d: "Know what each tool is for. Use a few hands-on, and keep a one-line answer for the rest.", flip: true, v: "tbl" },
              { t: "A weekly plan that keeps score", d: "Tasks come with hours attached. Tick them and watch each week fill up.", flip: false, v: "wk" },
            ].map((f) => (
              <Box key={f.t} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: f.flip ? "1.1fr 1fr" : "1fr 1.1fr" }, gap: { xs: 3.5, md: 8 }, alignItems: "center", py: 4.5 }}>
                <Box sx={{ order: { md: f.flip ? 2 : 0 } }}>
                  <Typography variant="h3" sx={{ fontSize: "clamp(22px, 2.6vw, 30px)" }}>{f.t}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.65, maxWidth: "44ch" }}>{f.d}</Typography>
                </Box>
                <Box sx={mockSx}>
                  {f.v === "acc" && (
                    <>
                      <Accordion defaultExpanded disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: "12px !important", "&:before": { display: "none" } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>2.3 RAG architecture</Typography>
                            <Typography variant="body2" color="text.secondary">The most repeated requirement</Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "#e9f7f4", fontSize: 13.5, lineHeight: 1.5, color: "#0b4a45" }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "primary.main", mb: 0.5 }}>Say in an interview</Typography>
                            I fix retrieval before touching the prompt, and measure with a golden set.
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                      {["2.4 Vector databases", "2.5 Agents and orchestration"].map((t) => (
                        <Accordion key={t} disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: "12px !important", "&:before": { display: "none" } }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{t}</Typography></AccordionSummary>
                          <AccordionDetails><Typography variant="body2" color="text.secondary">Key points, study links and a line to say out loud.</Typography></AccordionDetails>
                        </Accordion>
                      ))}
                    </>
                  )}
                  {f.v === "tbl" &&
                    [["LangGraph", true], ["pgvector", true], ["LlamaIndex", false], ["CrewAI", false]].map(([n, use]) => (
                      <Box key={String(n)} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#fff", border: 1, borderColor: "divider", borderRadius: 3, px: 2, py: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>{String(n)}</Typography>
                        <Chip size="small" label={use ? "Use" : "Know"} color={use ? "primary" : "default"} variant={use ? "filled" : "filled"} sx={use ? { bgcolor: "#d9f0ec", color: "#115e59" } : undefined} />
                      </Box>
                    ))}
                  {f.v === "wk" &&
                    [["Week 1", 100], ["Week 2", 72], ["Week 3", 35], ["Week 4", 0]].map(([w, v]) => (
                      <Box key={String(w)} sx={{ display: "grid", gridTemplateColumns: "64px 1fr 44px", alignItems: "center", gap: 1.75, bgcolor: "#fff", border: 1, borderColor: "divider", borderRadius: 3, px: 2, py: 1.75 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{String(w)}</Typography>
                        <LinearProgress variant="determinate" value={Number(v)} />
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>{String(v)}%</Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            ))}
          </Container>
        </Box>

        {/* TRACKS */}
        <Box id="tracks" sx={wrapSx}>
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: 640, mb: 7 }}>
              <Chip label="Tracks" size="small" sx={eyebrow} />
              <Typography variant="h2" sx={{ ...h2, mt: 1.75 }}>Follow one. Follow them all. Switch in a click.</Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(260px, 1fr))" }, gap: 2.5 }}>
              {tracks.map((t) => (
                <Card key={t.id} sx={{ transition: "transform .25s ease, box-shadow .25s ease, border-color .25s", "&:hover": { transform: "translateY(-5px)", borderColor: "#a7d8cf", boxShadow: "0 24px 44px -26px rgba(15,118,110,.5)" } }}>
                  <CardContent sx={{ p: 3.25, display: "grid", gap: 1.25 }}>
                    <Avatar variant="rounded" sx={{ width: 44, height: 44, borderRadius: 3, fontWeight: 800, fontSize: 15, background: "linear-gradient(135deg,#0f766e,#14b8a6)" }}>{t.title.slice(0, 2).toUpperCase()}</Avatar>
                    <Typography variant="h5" sx={{ mt: 0.75 }}>{t.title}</Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>{t.blurb}</Typography>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>{t.meta}</Typography>
                  </CardContent>
                </Card>
              ))}
              <Card sx={{ borderStyle: "dashed", bgcolor: "transparent" }}>
                <CardContent sx={{ p: 3.25, display: "grid", gap: 1.25 }}>
                  <Avatar variant="rounded" sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: "#e6f6f3", color: "primary.main" }}><AddIcon /></Avatar>
                  <Typography variant="h5" sx={{ mt: 0.75 }}>More on the way</Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>New tracks land here as they are written. Your progress in each one is kept separately.</Typography>
                </CardContent>
              </Card>
            </Box>
          </Container>
        </Box>

        {/* CTA */}
        <Container maxWidth="lg" sx={{ pb: { xs: 9, md: 14 } }}>
          <Box sx={{ textAlign: "center", color: "#fff", px: 3, py: { xs: 7, md: 9 }, borderRadius: 7, background: "radial-gradient(60% 90% at 80% 0%, #14b8a6, transparent 60%), linear-gradient(135deg,#115e59,#0f766e)" }}>
            <Typography variant="h2" sx={{ maxWidth: "18ch", mx: "auto", fontSize: "clamp(28px, 4.4vw, 48px)", textWrap: "balance" }}>Your next interview starts with the first tick.</Typography>
            <Typography sx={{ mt: 1.75, color: "rgba(255,255,255,.8)", fontSize: 17 }}>Create an account, pick a track, and open week one.</Typography>
            <Box sx={{ mt: 3.5, display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
              <Button component={Link} href="/sign-up" size="large" sx={{ bgcolor: "#fff", color: "#115e59", "&:hover": { bgcolor: "#fff" } }}>Create your account</Button>
              <Button component={Link} href="/sign-in" size="large" variant="outlined" sx={{ color: "#fff", borderColor: "rgba(255,255,255,.45)", "&:hover": { borderColor: "#fff" } }}>Sign in</Button>
            </Box>
          </Box>
        </Container>
      </main>

      <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", py: 3.5 }}>
        <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Logo size={20} />
          <Typography variant="body2" color="text.secondary">Made with &lt;3 by Shivam and Claude</Typography>
        </Container>
      </Box>
    </Box>
  );
}
