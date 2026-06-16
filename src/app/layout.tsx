import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Security Scanner Dashboard",
  description: "Authenticated domain and IP security scanner with report history."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
