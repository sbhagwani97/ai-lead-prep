"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";

// The one header for every signed-in page: logo, optional controls next to it (the
// course page puts its track switcher there), optional controls on the right, and the
// account menu, which also links to the account page.
export default function AppNav({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: "rgba(250,251,250,.86)", backdropFilter: "saturate(1.4) blur(12px)", borderBottom: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 60, sm: 64 }, gap: { xs: 1.25, sm: 2 } }}>
          <Link href="/prep" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: "inherit", textDecoration: "none", flex: "none" }}>
            <img src="/logo-mark.svg" alt="" width={26} height={26} />
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Preppy</Box>
          </Link>
          {left}
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: { xs: 1.25, sm: 2 } }}>
            {right}
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link label="Your account and tracks" href="/account" labelIcon={<PersonOutlineIcon sx={{ fontSize: 16 }} />} />
              </UserButton.MenuItems>
            </UserButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
