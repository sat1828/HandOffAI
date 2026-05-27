import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "HandOffAI — Clinical Handoff Intelligence",
  description: "The last handoff a hospital ever gets wrong. Voice-to-structured-note AI for clinical shift changes.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers><ErrorBoundary>{children}</ErrorBoundary></Providers>
      </body>
    </html>
  );
}
