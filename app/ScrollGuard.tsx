"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// <body> survives client-side navigation, so a scroll lock left behind by an overlay,
// menu or dialog on one page would freeze every page after it. On each route change,
// clear a leftover lock unless a modal is actually open.
export default function ScrollGuard() {
  const pathname = usePathname();
  useEffect(() => {
    const open = document.querySelector(".MuiModal-root:not(.MuiModal-hidden), [role='dialog'][aria-modal='true']");
    if (open) return;
    for (const el of [document.body, document.documentElement]) {
      if (el.style.overflow === "hidden") el.style.removeProperty("overflow");
      if (el.style.paddingRight) el.style.removeProperty("padding-right");
    }
  }, [pathname]);
  return null;
}
