import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "The Wedding Wish | A Little Shagun. A Lifetime of Dreams.",
  description:
    "An AI-powered retro pixel-art registry modernising Indian wedding gifting. Traditional shagun, reimagined.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#FFF7F2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] bg-cream text-deep antialiased selection:bg-rose-dusty selection:text-deep font-retro overflow-x-hidden">
        <AuthProvider>
          <div className="flex min-h-[100dvh] flex-col">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
