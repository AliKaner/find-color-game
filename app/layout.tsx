import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ColorGuess - Color Memory Game",
  description: "A minimalist, high-end color memory game built with Next.js. Test your ability to recall and recreate complex hues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
