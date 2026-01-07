import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "banana.fyi - AI-Powered Slides",
  description: "Generate absurd AI presentations on any topic and present them with a straight face. The ultimate party game where you present slides you've never seen before.",
  keywords: ["banana.fyi", "AI presentation maker", "AI slides", "presentation generator", "slide creator", "AI deck builder", "presentation tool"],
  authors: [{ name: "banana.fyi" }],
  openGraph: {
    title: "banana.fyi",
    description: "Present slides you've never seen before. AI generates absurd presentations, you try to keep a straight face.",
    type: "website",
    locale: "en_US",
    siteName: "banana.fyi",
  },
  twitter: {
    card: "summary_large_image",
    title: "banana.fyi",
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
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(0, 0, 0, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
            },
          }}
        />
      </body>
    </html>
  );
}
