import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://banana.fyi"),
  applicationName: "banana.fyi",
  category: "technology",
  title: "banana.fyi - AI-Powered Slides",
  description: "Create beautiful AI-powered presentations in seconds. Generate complete slide decks on any topic or build from scratch.",
  keywords: ["banana.fyi", "AI presentation maker", "AI slides", "presentation generator", "slide creator", "AI deck builder", "presentation tool"],
  authors: [{ name: "banana.fyi" }],
  openGraph: {
    title: "banana.fyi",
    description: "Create beautiful AI-powered presentations in seconds. Generate complete slide decks on any topic.",
    type: "website",
    locale: "en_US",
    siteName: "banana.fyi",
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "banana.fyi",
    description: "Create beautiful AI-powered presentations in seconds. Generate complete slide decks on any topic.",
    images: ["/icon.svg"],
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
        <Providers>
          {children}
        </Providers>
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
