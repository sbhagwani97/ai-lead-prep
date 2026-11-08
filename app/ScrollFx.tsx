"use client";

import { useEffect } from "react";

// Scroll-driven effects for the landing page:
//  - [data-reveal] fades/slides in once when it enters the viewport
//  - [data-fill] animates a progress bar to its target width when seen
//  - [data-count] counts up to a number when seen
//  - CSS vars on <html>: --scroll (0..1 page progress) and --hero (0..1 over the first screen)
//  - [data-draw] draws a line as its section scrolls through the viewport
//  - [data-story] a tall section with a pinned card: ring, week, tasks and percent follow scroll
export default function ScrollFx() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const t = e.target as HTMLElement;
          t.classList.add("in");
          const fill = t.dataset.fill;
          if (fill) t.style.setProperty("--fill", fill);
          const count = t.dataset.count;
          if (count) animateCount(t, Number(count), reduce);
          seen.unobserve(t);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );
    document
      .querySelectorAll("[data-reveal],[data-fill],[data-count]")
      .forEach((n) => seen.observe(n));

    const draws = Array.from(document.querySelectorAll<HTMLElement>("[data-draw]"));
    const story = document.querySelector<HTMLElement>("[data-story]");
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const h = window.innerHeight;
      const max = Math.max(1, root.scrollHeight - h);
      root.style.setProperty("--scroll", String(Math.min(1, y / max)));
      root.style.setProperty("--hero", String(Math.min(1, y / h)));
      for (const d of draws) {
        const r = d.getBoundingClientRect();
        const p = (h * 0.75 - r.top) / (r.height + h * 0.25);
        d.style.setProperty("--draw", String(Math.max(0, Math.min(1, p))));
      }
      if (story) updateStory(story, reduce ? 1 : undefined);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    if (!reduce) window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      seen.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}

function animateCount(el: HTMLElement, to: number, reduce: boolean) {
  if (reduce) {
    el.textContent = String(to);
    return;
  }
  const start = performance.now();
  const dur = 900;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Scroll-driven progress card: the tall [data-story] section pins its stage while the
// scroll position inside it (0..1) drives the ring, the active week and the ticked tasks.
function updateStory(st: HTMLElement, force?: number) {
  const h = window.innerHeight;
  const r = st.getBoundingClientRect();
  const p = force ?? Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - h)));
  st.style.setProperty("--story", String(p));
  const weeks = st.querySelectorAll<HTMLElement>("[data-week]");
  const n = weeks.length || 1;
  const step = Math.min(n - 1, Math.floor(p * n));
  const local = p * n - step;
  st.dataset.step = String(step);
  weeks.forEach((w, wi) => {
    w.classList.toggle("act", wi === step);
    const tasks = w.querySelectorAll<HTMLElement>("[data-t]");
    tasks.forEach((t, ti) =>
      t.classList.toggle("done", wi < step || (wi === step && local > (ti + 0.6) / (tasks.length + 0.4)))
    );
  });
  st.querySelectorAll<HTMLElement>("[data-step-item]").forEach((li, i) => {
    li.classList.toggle("on", i === step);
    li.classList.toggle("past", i < step);
  });
  st.querySelectorAll<HTMLElement>("[data-seg]").forEach((sg, i) =>
    sg.style.setProperty("--seg", String(Math.max(0, Math.min(1, p * n - i))))
  );
  const pct = st.querySelector<HTMLElement>("[data-story-pct]");
  if (pct) pct.textContent = String(Math.round(p * 100));
  const wl = st.querySelector<HTMLElement>("[data-story-week]");
  if (wl) wl.textContent = "Week " + (step + 1) + " of " + n;
}
