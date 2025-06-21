import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:3000"),
  title: "DailyTik - Your Daily Productivity Tracker",
  description:
    "DailyTik helps you organize your day with todos, notes, and more. Boost your productivity with a simple, beautiful, and powerful daily tracker.",
  keywords: [
    "DailyTik",
    "todo app",
    "daily tracker",
    "productivity",
    "notes",
    "task manager",
    "Next.js",
    "MERN",
    "organizer",
    "daily planner",
    "notes app",
    "todo list",
  ],
  openGraph: {
    title: "DailyTik - Your Daily Productivity Tracker",
    description:
      "DailyTik helps you organize your day with todos, notes, and more. Boost your productivity with a simple, beautiful, and powerful daily tracker.",
    url: "https://dailytik-app.vercel.app/",
    siteName: "DailyTik",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "DailyTik Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DailyTik - Your Daily Productivity Tracker",
    description:
      "DailyTik helps you organize your day with todos, notes, and more. Boost your productivity with a simple, beautiful, and powerful daily tracker.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ToastContainer />
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
