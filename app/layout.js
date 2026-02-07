import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DataPulse - Universal Data Tracking & Intelligence",
  description:
    "AI-powered EdTech platform with real-time analytics and intelligent insights",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
