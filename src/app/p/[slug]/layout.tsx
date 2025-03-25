import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export default function PublicPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className} suppressHydrationWarning>
      {children}
    </div>
  );
} 