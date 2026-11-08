import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { baseVariables } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Preppy",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ variables: baseVariables }}>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
