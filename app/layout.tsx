import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GGA Client Portal",
  description: "Green Growth Agency — Client Onboarding Portal",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
