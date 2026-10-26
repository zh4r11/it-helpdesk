"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function LacakForm({
  defaultValue = "",
  className,
  size = "default",
}: {
  defaultValue?: string;
  className?: string;
  size?: "default" | "lg";
}) {
  const router = useRouter();
  const [nomor, setNomor] = useState(defaultValue);
  const [processing, startTransition] = useTransition();

  return (
    <form
      className={cn("flex w-full gap-2", className)}
      onSubmit={(event) => {
        event.preventDefault();

        if (!nomor.trim()) {
          return;
        }

        startTransition(() => {
          router.push(`/lacak?nomor=${encodeURIComponent(nomor.trim())}`);
        });
      }}
    >
      <label htmlFor="nomor" className="sr-only">
        Nomor laporan
      </label>
      <Input
        id="nomor"
        value={nomor}
        onChange={(event) => setNomor(event.target.value)}
        placeholder="Masukkan nomor laporan, mis. LKTI-0001"
        className={cn("uppercase placeholder:normal-case", size === "lg" && "h-11 text-base")}
        autoComplete="off"
        required
      />
      <Button type="submit" disabled={processing} className={cn(size === "lg" && "h-11 px-5")}>
        <Search />
        Cek
      </Button>
    </form>
  );
}
