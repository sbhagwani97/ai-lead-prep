"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";

export default function AppNav({ right }: { right?: ReactNode }) {
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: "rgba(251,251,255,.82)", backdropFilter: "saturate(1.4) blur(12px)", borderBottom: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 64, justifyContent: "space-between" }}>
          <Link href="/prep" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: "inherit", textDecoration: "none" }}>
            <img src="/logo-mark.svg" alt="" width={26} height={26} />
            Preppy
          </Link>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>{right}</Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
