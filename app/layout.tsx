import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Banana.ppt - AI-Powered Improv Slides",
  description: "Generate absurd AI presentations on any topic and present them with a straight face. The ultimate party game where you present slides you've never seen before.",
  keywords: ["banana.ppt", "presentation karaoke", "party game", "AI presentations", "improv game", "powerpoint karaoke", "slide karaoke"],
  authors: [{ name: "Banana.ppt" }],
  openGraph: {
    title: "Banana.ppt",
    description: "Present slides you've never seen before. AI generates absurd presentations, you try to keep a straight face.",
    type: "website",
    locale: "en_US",
    siteName: "Banana.ppt",
  },
  twitter: {
    card: "summary_large_image",
    title: "Banana.ppt",
    description: "Present slides you've never seen before. AI generates absurd presentations, you try to keep a straight face.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
