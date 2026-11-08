// Scroll effects for the course pages: top progress bar and reveal-on-scroll for cards.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var raf = 0;
  function update() {
    raf = 0;
    var max = Math.max(1, root.scrollHeight - window.innerHeight);
    root.style.setProperty("--scroll", String(Math.min(1, window.scrollY / max)));
  }
  window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener("resize", update);
  update();

  if (reduce || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });

  var n = 0;
  document.querySelectorAll("details.card, .wk, .scroll, .note").forEach(function (el, i) {
    el.classList.add("rv");
    el.style.setProperty("--rd", (i % 4) * 60 + "ms");
    io.observe(el);
    n++;
  });
})();
