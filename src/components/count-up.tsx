"use client";

import { useEffect, useState } from "react";
import { formatAngka } from "@/lib/format";

/**
 * Angka yang "menghitung" dari 0 ke `value` saat tampil.
 * Pengguna dengan prefers-reduced-motion langsung melihat angka akhir.
 */
export function CountUp({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = reduce ? 1 : Math.min((now - start) / duration, 1);
      // easeOutCubic: cepat di awal, melambat di akhir.
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span aria-label={formatAngka(value)}>{formatAngka(current)}</span>;
}
