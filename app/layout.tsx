import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dialed. - Color Memory Game",
  description: "A minimalist, high-end color memory game built with Next.js",
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
