import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXORA | Automate Beyond Limits",
  description: "Visual workflow automation and orchestration SaaS for developers and modern teams.",
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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#101827] text-[#F8FAFC] antialiased selection:bg-[#22D3EE]/30 selection:text-[#22D3EE]">
        {children}
      </body>
    </html>
  );
}
