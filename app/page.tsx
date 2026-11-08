import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TRACKS } from "@/lib/tracks";
import ScrollFx from "./ScrollFx";
import "./landing.css";

const STEPS = [
  {
    n: "01",
    t: "Pick your tracks",
    d: "Choose the role you are preparing for. Follow one, or several, and change your mind any time.",
  },
  {
    n: "02",
    t: "Follow a 6-week plan",
    d: "Every track is a week-by-week plan with the concepts, tools and study links that interviews actually probe.",
  },
  {
    n: "03",
    t: "Tick it off, anywhere",
    d: "Your progress is saved to your account, so it follows you from laptop to phone and back.",
  },
];

const DEMO_TASKS = [
  "Read concepts 2.1 and 2.2",
  "Lab: structured output with validation",
  "Set up Postgres with pgvector",
  "Build RAG v1 with citations",
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/prep");

  return (
    <div className="lp">
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}.lp-bar i{width:var(--fill-final,40%)!important}`}</style>
      </noscript>
      <ScrollFx />
      <div className="lp-progress" aria-hidden />

      <header className="lp-nav">
        <div className="lp-wrap lp-nav-in">
          <Link href="/" className="lp-brand">
            <img src="/logo-mark.svg" alt="" width={26} height={26} />
            Preppy
          </Link>
          <nav className="lp-links" aria-label="Page">
            <a href="#how">How it works</a>
            <a href="#inside">Inside a track</a>
            <a href="#tracks">Tracks</a>
          </nav>
          <div className="lp-nav-cta">
            <Link className="lp-btn ghost" href="/sign-in">Sign in</Link>
            <Link className="lp-btn primary" href="/sign-up">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-glow" aria-hidden />
          <div className="lp-wrap lp-hero-in">
            <div className="lp-hero-copy">
              <span className="lp-eyebrow" data-reveal>Interview prep, track by track</span>
              <h1 data-reveal style={{ "--d": 1 } as React.CSSProperties}>
                Prep for the AI job you <em>actually</em> want.
              </h1>
              <p data-reveal style={{ "--d": 2 } as React.CSSProperties}>
                Preppy turns what job descriptions ask for into a focused 6-week plan: the concepts,
                the tools, and a project to show for it. No tutorials, no filler.
              </p>
              <div className="lp-row" data-reveal style={{ "--d": 3 } as React.CSSProperties}>
                <Link className="lp-btn primary lg" href="/sign-up">Start preparing</Link>
                <a className="lp-btn lg" href="#how">See how it works</a>
              </div>
            </div>

            <div className="lp-stage" aria-hidden>
              <div className="lp-float lp-chip c1">13 concepts</div>
              <div className="lp-float lp-chip c2">1 project</div>
              <div className="lp-app">
                <div className="lp-app-top">
                  <span className="dot" /><span className="dot" /><span className="dot" />
                  <span className="lp-app-title">Preppy</span>
                  <span className="lp-pill">{TRACKS[0]?.title}</span>
                </div>
                <div className="lp-app-body">
                  <div className="lp-app-row">
                    <b>Week 1</b>
                    <span>Foundations, prompting, RAG basics</span>
                  </div>
                  <div className="lp-bar"><i className="demo" /></div>
                  <ul className="lp-tasks">
                    {DEMO_TASKS.map((t, i) => (
                      <li key={t} style={{ "--i": i } as React.CSSProperties}>
                        <span className="box"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" /></svg></span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <a className="lp-scroll" href="#how" aria-label="Scroll to how it works"><span /></a>
        </section>

        {/* FACTS */}
        <section className="lp-facts">
          <div className="lp-wrap lp-facts-in">
            <div data-reveal><b data-count="6">0</b><span>week plans</span></div>
            <div data-reveal style={{ "--d": 1 } as React.CSSProperties}><b data-count="150">0</b><span>focused hours per track</span></div>
            <div data-reveal style={{ "--d": 2 } as React.CSSProperties}><b data-count={TRACKS.length}>0</b><span>tracks, more coming</span></div>
            <div data-reveal style={{ "--d": 3 } as React.CSSProperties}><b>Any</b><span>device, progress synced</span></div>
          </div>
        </section>

        {/* HOW */}
        <section className="lp-sec" id="how">
          <div className="lp-wrap">
            <div className="lp-head" data-reveal>
              <span className="lp-eyebrow">How it works</span>
              <h2>Three steps. Then you just show up.</h2>
            </div>
            <div className="lp-steps" data-draw>
              <div className="lp-line" aria-hidden><i /></div>
              {STEPS.map((s, i) => (
                <div className="lp-step" key={s.n} data-reveal style={{ "--d": i } as React.CSSProperties}>
                  <span className="n">{s.n}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INSIDE */}
        <section className="lp-sec alt" id="inside">
          <div className="lp-wrap">
            <div className="lp-head" data-reveal>
              <span className="lp-eyebrow">Inside a track</span>
              <h2>Everything at interview depth, nothing else.</h2>
            </div>

            <div className="lp-feature">
              <div className="txt" data-reveal>
                <h3>Concepts with a line you can say out loud</h3>
                <p>Each card has the few points interviewers probe, study links, and a sentence to practise.</p>
              </div>
              <div className="vis from-right" data-reveal>
                <div className="lp-acc">
                  <div className="open"><b>2.3 RAG architecture</b><span>The most repeated requirement</span>
                    <div className="say"><i>Say in an interview</i>I fix retrieval before touching the prompt, and measure with a golden set.</div>
                  </div>
                  <div><b>2.4 Vector databases</b></div>
                  <div><b>2.5 Agents and orchestration</b></div>
                </div>
              </div>
            </div>

            <div className="lp-feature flip">
              <div className="txt" data-reveal>
                <h3>Tools, ranked by how deep to go</h3>
                <p>Know what each tool is for. Use a few hands-on, and keep a one-line answer for the rest.</p>
              </div>
              <div className="vis from-left" data-reveal>
                <div className="lp-tbl">
                  <div><span>LangGraph</span><em className="use">Use</em></div>
                  <div><span>pgvector</span><em className="use">Use</em></div>
                  <div><span>LlamaIndex</span><em className="know">Know</em></div>
                  <div><span>CrewAI</span><em className="know">Know</em></div>
                </div>
              </div>
            </div>

            <div className="lp-feature">
              <div className="txt" data-reveal>
                <h3>A weekly plan that keeps score</h3>
                <p>Tasks come with hours attached. Tick them and watch each week fill up.</p>
              </div>
              <div className="vis from-right" data-reveal>
                <div className="lp-weeks">
                  {[
                    ["Week 1", "100%"],
                    ["Week 2", "72%"],
                    ["Week 3", "35%"],
                    ["Week 4", "0%"],
                  ].map(([w, p]) => (
                    <div key={w}>
                      <span>{w}</span>
                      <div className="lp-bar"><i data-fill={p} /></div>
                      <em>{p}</em>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRACKS */}
        <section className="lp-sec" id="tracks">
          <div className="lp-wrap">
            <div className="lp-head" data-reveal>
              <span className="lp-eyebrow">Tracks</span>
              <h2>Follow one. Follow them all. Switch in a click.</h2>
            </div>
            <div className="lp-tracks">
              {TRACKS.map((t, i) => (
                <article className="lp-track" key={t.id} data-reveal style={{ "--d": i } as React.CSSProperties}>
                  <span className="badge">{t.title.slice(0, 2).toUpperCase()}</span>
                  <h3>{t.title}</h3>
                  <p>{t.blurb}</p>
                  <span className="meta">{t.meta}</span>
                </article>
              ))}
              <article className="lp-track soon" data-reveal style={{ "--d": TRACKS.length } as React.CSSProperties}>
                <span className="badge">+</span>
                <h3>More on the way</h3>
                <p>New tracks land here as they are written. Your progress in each one is kept separately.</p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="lp-cta-sec">
          <div className="lp-wrap">
            <div className="lp-cta" data-reveal>
              <h2>Your next interview starts with the first tick.</h2>
              <p>Create an account, pick a track, and open week one.</p>
              <div className="lp-row">
                <Link className="lp-btn light lg" href="/sign-up">Create your account</Link>
                <Link className="lp-btn outline lg" href="/sign-in">Sign in</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-in">
          <span className="lp-brand sm">
            <img src="/logo-mark.svg" alt="" width={20} height={20} />
            Preppy
          </span>
          <span>Made with &lt;3 by Shivam and Claude</span>
        </div>
      </footer>
    </div>
  );
}
