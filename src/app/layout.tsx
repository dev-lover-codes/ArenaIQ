import type { Metadata } from "next";
import localFont from 'next/font/local'
import "./globals.css";

const inter = localFont({
  src: './fonts/Inter-Variable.woff2',
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = localFont({
  src: './fonts/JetBrainsMono-Variable.woff2',
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "ArenaIQ — Smart Stadium Operations for FIFA World Cup 2026™",
  description: "GenAI-powered smart stadium platform for FIFA World Cup 2026. Real-time crowd management, AI-driven fan navigation, multi-language assistance, and staff coordination.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
