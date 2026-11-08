"use client";

import Link from "next/link";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import AppNav from "../AppNav";

export default function AccountView({
  name,
  fullName,
  email,
  tracks,
}: {
  name: string;
  fullName: string;
  email: string;
  tracks: string[];
}) {
  return (
    <Box sx={{ minHeight: "100vh", background: "radial-gradient(50% 40% at 85% 0%, rgba(45,212,191,.14), transparent 70%), radial-gradient(40% 40% at 0% 20%, rgba(20,184,166,.1), transparent 70%), #fafbfa" }}>
      <AppNav />
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 9 }, display: "grid", gap: 3.5, justifyItems: "center", textAlign: "center" }}>
        <Typography variant="h1" sx={{ fontSize: "clamp(30px, 4.4vw, 46px)", background: "linear-gradient(100deg,#115e59,#0f766e 70%,#14b8a6)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Hi, {name}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 17, lineHeight: 1.6, mt: -1.5 }}>
          Your progress is saved to your account, so it follows you across devices.
        </Typography>

        <Card sx={{ width: "100%", textAlign: "left", boxShadow: "0 30px 60px -40px rgba(15,118,110,.45)" }}>
          <CardContent sx={{ p: 3.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <UserButton />
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 700 }}>{fullName || name}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{email}</Typography>
              </Box>
            </Box>
            <Typography variant="h6" sx={{ mb: 1.25 }}>Your tracks</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
              {tracks.length ? (
                tracks.map((t) => <Chip key={t} label={t} sx={{ bgcolor: "#e6f6f3", color: "primary.dark" }} />)
              ) : (
                <Typography color="text.secondary">You have not joined a track yet.</Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button component={Link} href="/prep" variant="contained" size="large">Back to the plan</Button>
              <Button component={Link} href="/tracks" variant="outlined" color="inherit" size="large" sx={{ borderColor: "divider" }}>Manage tracks</Button>
              <SignOutButton redirectUrl="/">
                <Button variant="outlined" color="inherit" size="large" sx={{ borderColor: "divider" }}>Sign out</Button>
              </SignOutButton>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
