import { LayoutGrid, LogIn } from "lucide-react";
import Link from "next/link";
import { AppLogoIcon } from "@/components/app-logo";
import { PublicNav } from "@/components/public-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/helpdesk";
import { getSession } from "@/lib/session";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg pointer-coarse:min-h-11">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <AppLogoIcon className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-semibold">{APP_NAME}</span>
              <span className="hidden text-xs text-muted-foreground sm:block">Layanan Pengaduan Permasalahan TI</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <PublicNav />
            <ThemeToggle />
            <Button asChild size="sm" variant="outline" className="pointer-coarse:min-w-11">
              {session ? (
                <Link href="/dashboard">
                  <LayoutGrid />
                  <span className="sr-only sm:not-sr-only">Dashboard</span>
                </Link>
              ) : (
                <Link href="/login">
                  <LogIn />
                  <span className="sr-only sm:not-sr-only">Login Petugas</span>
                </Link>
              )}
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground sm:text-left md:px-6">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
