"use client";
import { createContext, useContext, useMemo } from "react";
import {
  effectiveMenuVisibility,
  type EffectiveMenuVisibility,
  type MenuVisibilityOverrides,
} from "./menu-visibility.logic";

// Context, bukan Valtio: data read-only dari server layout per request. Proxy Valtio di level
// modul akan ikut dipakai bersama semua request SSR, sedangkan context terikat ke render ini.
const MenuVisibilityContext = createContext<EffectiveMenuVisibility>(effectiveMenuVisibility({}));

/** Sediakan menu publik efektif (default config + override DB) ke navbar, pencarian, dan guard 404. */
export function MenuVisibilityProvider({
  overrides,
  children,
}: {
  overrides: MenuVisibilityOverrides;
  children: React.ReactNode;
}) {
  const value = useMemo(() => effectiveMenuVisibility(overrides), [overrides]);
  return <MenuVisibilityContext.Provider value={value}>{children}</MenuVisibilityContext.Provider>;
}

/** Menu publik efektif; di luar provider = default config tanpa override. */
export function useMenuVisibility(): EffectiveMenuVisibility {
  return useContext(MenuVisibilityContext);
}
