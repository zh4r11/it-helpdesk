import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_NAME } from "@/lib/helpdesk";
import "./globals.css";

// Sama dengan versi Laravel, agar tampilan tetap dikenali pengguna lama.
const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Untuk nomor laporan dan IP yang dibaca karakter per karakter.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s - ${APP_NAME}`,
  },
  description: "Sistem Informasi Pengaduan Kerusakan Barang & Permasalahan TI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${instrumentSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
