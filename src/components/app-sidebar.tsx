"use client";

import {
  Boxes,
  Building2,
  ChevronsUpDown,
  Cpu,
  FileBarChart,
  Globe,
  Inbox,
  LayoutGrid,
  LogOut,
  Monitor,
  Settings,
  Tag,
  Tags,
  UserCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AppLogo from "@/components/app-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserInfo, type UserSummary } from "@/components/user-info";
import { authClient } from "@/lib/auth-client";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  /** Tandai aktif juga untuk sub-halaman (mis. /admin/komputer/1). */
  matchPrefix?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export type SidebarBadges = { pengaduan: number; users: number };

export function AppSidebar({ user, badges }: { user: UserSummary; badges: SidebarBadges }) {
  const groups: NavGroup[] = [
    {
      title: "Utama",
      items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutGrid }],
    },
    {
      title: "Helpdesk",
      items: [
        { title: "Pengaduan", href: "/admin/pengaduan", icon: Inbox, badge: badges.pengaduan, matchPrefix: true },
        { title: "Laporan", href: "/admin/laporan", icon: FileBarChart },
      ],
    },
    {
      title: "Inventaris",
      items: [
        { title: "Data PC", href: "/admin/komputer", icon: Monitor, matchPrefix: true },
        { title: "Komponen", href: "/admin/komponen", icon: Cpu },
        { title: "Kategori", href: "/admin/kategori", icon: Tags },
        { title: "Merk", href: "/admin/merk", icon: Tag },
      ],
    },
    {
      title: "Organisasi",
      items: [
        { title: "Karyawan", href: "/admin/karyawan", icon: Users },
        { title: "Divisi", href: "/admin/divisi", icon: Building2 },
        { title: "Akun Pengguna", href: "/admin/users", icon: UserCog, badge: badges.users },
      ],
    },
  ];

  const footerItems = [
    { title: "Halaman Publik", href: "/", icon: Globe },
    { title: "Form Pengaduan", href: "/pengaduan", icon: Boxes },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={groups} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup className="mt-auto group-data-[collapsible=icon]:p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {footerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                  >
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.title} className="px-2 py-0">
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.matchPrefix ? pathname.startsWith(item.href) : pathname === item.href}
                  tooltip={{ children: item.title }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {!!item.badge && (
                  <SidebarMenuBadge className="bg-primary text-primary-foreground peer-hover/menu-button:text-primary-foreground peer-data-[active=true]/menu-button:text-primary-foreground">
                    {item.badge}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

function NavUser({ user }: { user: UserSummary }) {
  const router = useRouter();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const logout = async () => {
    setOpenMobile(false);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
            >
              <UserInfo user={user} />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="end"
            side={isMobile ? "bottom" : state === "collapsed" ? "left" : "bottom"}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserInfo user={user} showEmail />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link className="block w-full cursor-pointer" href="/settings/profile" onClick={() => setOpenMobile(false)}>
                  <Settings className="mr-2" />
                  Pengaturan
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onSelect={logout}>
              <LogOut className="mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
