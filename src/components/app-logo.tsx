import { Headset } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/helpdesk";

export function AppLogoIcon({ className, ...props }: ComponentProps<typeof Headset>) {
  return <Headset {...props} className={cn(className, "fill-none")} />;
}

export default function AppLogo() {
  return (
    <>
      <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <AppLogoIcon className="size-5" />
      </div>
      <div className="ml-1 grid flex-1 text-left text-sm">
        <span className="truncate leading-tight font-semibold">{APP_NAME}</span>
        <span className="truncate text-xs text-muted-foreground">Panel Admin</span>
      </div>
    </>
  );
}
