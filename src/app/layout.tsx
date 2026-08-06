import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "ICFT Contact Information System", description: "A future contact information collection system for ICFT." };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
