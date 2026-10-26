import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const sidebarState = (await cookies()).get("sidebar_state")?.value;

  const [pengaduan, users] = await Promise.all([
    prisma.pengaduan.count({ where: { status: "diajukan" } }),
    prisma.user.count({ where: { isActive: false } }),
  ]);

  return (
    <SidebarProvider defaultOpen={sidebarState !== "false"}>
      <AppSidebar
        user={{ id: user.id, name: user.name, username: user.username ?? "", email: user.email, image: user.image }}
        badges={{ pengaduan, users }}
      />
      <SidebarInset className="min-w-0 overflow-x-clip">{children}</SidebarInset>
    </SidebarProvider>
  );
}
