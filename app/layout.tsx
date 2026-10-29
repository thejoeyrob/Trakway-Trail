import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Truckin’ & Drivin’",
  description: "Big rigs. Little roads. Questionable decisions. A colourful delivery-driving arcade game.",
  icons: {
    icon: "/assets/icon.png",
    shortcut: "/assets/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{margin:0,background:'#10272b',overflow:'hidden'}}>{children}</body>
    </html>
  );
}
