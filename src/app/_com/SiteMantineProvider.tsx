"use client";

import { isLightOnlyPath, THEME_COLOR } from "@/lib/color-scheme-scope";
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
 * konsol developer) skema dipaksa "light"; di luar itu mengikuti pilihan pengunjung (localStorage).
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
      defaultColorScheme="light"
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
  // pulihkan pilihan tersimpan pengunjung (mis. gelap) alih-alih membawa "light" dari admin.
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
    const root = document.documentElement;
    const apply = () => {
      const scheme = root.getAttribute("data-mantine-color-scheme") === "dark" ? "dark" : "light";
      document
        .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
        .forEach((meta) => meta.setAttribute("content", THEME_COLOR[scheme]));
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["data-mantine-color-scheme"] });
    return () => observer.disconnect();
  }, []);

  return null;
}
