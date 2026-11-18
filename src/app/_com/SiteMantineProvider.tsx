"use client";

import { DEFAULT_COLOR_SCHEME, isLightOnlyPath, syncThemeColorMeta } from "@/lib/color-scheme-scope";
import {
  MantineProvider,
  useMantineColorScheme,
  type MantineThemeOverride,
} from "@mantine/core";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { readStoredColorScheme, siteColorSchemeManager } from "./site-color-scheme";
import { siteCssVariablesResolver } from "./site-css-variables-resolver";

/**
 * MantineProvider akar dengan tema gelap terbatas situs publik: di rute selalu-terang (admin, akun,
 * konsol developer) skema dipaksa "light"; di luar itu mengikuti pilihan pengunjung (localStorage), atau OS
 * bila belum pernah memilih (DEFAULT_COLOR_SCHEME "auto").
 */
export function SiteMantineProvider({
  theme,
  children,
}: {
  theme: MantineThemeOverride;
  children: React.ReactNode;
}) {
  const lightOnly = isLightOnlyPath(usePathname());
  return (
    // v8CssVariablesResolver (dibungkus): warna varian v8 + shade gelap palet A, lihat resolver
    <MantineProvider
      theme={theme}
      defaultColorScheme={DEFAULT_COLOR_SCHEME}
      colorSchemeManager={siteColorSchemeManager}
      forceColorScheme={lightOnly ? "light" : undefined}
      cssVariablesResolver={siteCssVariablesResolver}
    >
      <ColorSchemeRouteSync lightOnly={lightOnly} />
      {children}
    </MantineProvider>
  );
}

/** Menyelaraskan skema saat pindah rute di client + warna theme-color browser. */
function ColorSchemeRouteSync({ lightOnly }: { lightOnly: boolean }) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  // Halaman pertama di admin membuat state Mantine "light"; saat pindah ke situs publik,
  // pulihkan pilihan tersimpan pengunjung (mis. gelap; belum memilih = "auto" → ikuti OS) alih-alih
  // membawa "light" dari admin.
  // Hanya pada peralihan admin → publik: tanpa localStorage (mode privat) tombol tema tetap jalan.
  const wasLightOnly = useRef(lightOnly);
  useEffect(() => {
    const leftLightOnly = wasLightOnly.current && !lightOnly;
    wasLightOnly.current = lightOnly;
    if (!leftLightOnly) return;
    const stored = readStoredColorScheme();
    if (stored !== colorScheme) setColorScheme(stored);
  }, [lightOnly, colorScheme, setColorScheme]);

  // <meta name="theme-color"> mengikuti atribut <html>, siapa pun yang mengubahnya (tombol, rute, tab lain).
  useEffect(() => {
    const apply = () => syncThemeColorMeta(document);
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mantine-color-scheme"] });
    // Navigasi client: Next mengganti <meta theme-color> dengan simpul baru bernilai bawaan (per media),
    // jadi pilihan tersimpan yang beda dari OS harus diterapkan ulang.
    observer.observe(document.head, { childList: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
