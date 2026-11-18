"use client";

import { Tooltip, useMantineColorScheme, VisuallyHidden } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { requestThemeTransition } from "@/state/state-theme-transition";
import s from "./navbar.module.css";
import {
  nextColorScheme,
  THEME_LABEL_TO_DARK,
  THEME_LABEL_TO_LIGHT,
} from "./theme-toggle.logic";

// Kelas global Mantine: disembunyikan (display:none, ikut hilang dari pembaca layar) per skema aktif.
// Ikon & label dipilih CSS, bukan state React, jadi HTML server = client (tanpa hydration mismatch).
const ON_LIGHT = "mantine-dark-hidden";
const ON_DARK = "mantine-light-hidden";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function ThemeLabel() {
  return (
    <>
      <span className={ON_LIGHT}>{THEME_LABEL_TO_DARK}</span>
      <span className={ON_DARK}>{THEME_LABEL_TO_LIGHT}</span>
    </>
  );
}

/** Tombol navbar (desktop & mobile) matahari/bulan untuk mengganti tema terang/gelap situs publik. */
export function NavbarThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  // Tema ditukar overlay transisi Candi Bentar di balik langitnya (ThemeGateTransition); langsung ditukar di sini
  // hanya bila kurangi gerak aktif atau overlay belum siap. Klik selama transisi berjalan diabaikan.
  const toggle = () => {
    const target = nextColorScheme(document.documentElement.getAttribute("data-mantine-color-scheme"));
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (requestThemeTransition(target, { reducedMotion }) === "direct") setColorScheme(target);
  };

  return (
    <Tooltip label={<ThemeLabel />} position="bottom" withArrow classNames={{ tooltip: s.tooltip }}>
      <button type="button" className={`${s.barItem} ${s.iconToggle}`} onClick={toggle}>
        <span className={s.toggleIcon} aria-hidden>
          <IconMoon className={ON_LIGHT} size={18} stroke={1.75} />
          <IconSun className={ON_DARK} size={18} stroke={1.75} />
        </span>
        <VisuallyHidden>
          <ThemeLabel />
        </VisuallyHidden>
      </button>
    </Tooltip>
  );
}
