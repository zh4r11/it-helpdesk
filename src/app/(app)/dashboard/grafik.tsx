"use client";

import { useSyncExternalStore } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type BarisGrafik = { bulan: string; diajukan: number; diproses: number; selesai: number };

const chartConfig = {
  diajukan: { label: "Diajukan", color: "var(--chart-1)" },
  diproses: { label: "Diproses", color: "var(--chart-2)" },
  selesai: { label: "Selesai", color: "var(--chart-3)" },
} satisfies ChartConfig;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION);
  mql.addEventListener("change", callback);

  return () => mql.removeEventListener("change", callback);
}

/** Batang tumbuh bertahap per status; dimatikan bila pengguna memilih kurangi animasi. */
function useBarAnimation() {
  const reduce = useSyncExternalStore(subscribe, () => window.matchMedia(REDUCED_MOTION).matches, () => false);

  return (urutan: number) => ({
    isAnimationActive: !reduce,
    animationBegin: urutan * 250,
    animationDuration: 700,
    animationEasing: "ease-out" as const,
  });
}

export function GrafikPengaduan({ data }: { data: BarisGrafik[] }) {
  const animasi = useBarAnimation();

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="bulan" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {/* Garis warna kartu memisahkan segmen yang bertumpuk agar batasnya tetap terlihat. */}
        <Bar dataKey="diajukan" stackId="a" fill="var(--color-diajukan)" stroke="var(--card)" {...animasi(0)} />
        <Bar dataKey="diproses" stackId="a" fill="var(--color-diproses)" stroke="var(--card)" {...animasi(1)} />
        <Bar
          dataKey="selesai"
          stackId="a"
          fill="var(--color-selesai)"
          stroke="var(--card)"
          radius={[4, 4, 0, 0]}
          {...animasi(2)}
        />
      </BarChart>
    </ChartContainer>
  );
}
