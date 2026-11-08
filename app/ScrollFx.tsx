"use client";

import { useEffect } from "react";

// Scroll-driven effects for the landing page:
//  - [data-reveal] fades/slides in once when it enters the viewport
//  - [data-fill] animates a progress bar to its target width when seen
//  - [data-count] counts up to a number when seen
//  - CSS vars on <html>: --scroll (0..1 page progress) and --hero (0..1 over the first screen)
//  - [data-draw] draws a line as its section scrolls through the viewport
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
