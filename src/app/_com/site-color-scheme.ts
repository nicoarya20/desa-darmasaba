import { isLightOnlyPath } from "@/lib/color-scheme-scope";
import { localStorageColorSchemeManager, type MantineColorSchemeManager } from "@mantine/core";

const storageManager = localStorageColorSchemeManager();

/**
 * Pengelola skema warna situs: sama dengan bawaan Mantine (localStorage), kecuali di area
 * selalu-terang (admin dsb.) `get()` mengembalikan "light" supaya pemasangan pertama MantineProvider
 * tidak menulis atribut gelap ke <html> (pilihan pengunjung di localStorage tetap utuh).
 */
export const siteColorSchemeManager: MantineColorSchemeManager = {
  ...storageManager,
  get: (defaultValue) =>
    typeof window !== "undefined" && isLightOnlyPath(window.location.pathname)
      ? "light"
      : storageManager.get(defaultValue),
};

/** Pilihan skema yang tersimpan (tanpa memandang rute); dipakai untuk memulihkan saat keluar dari admin. */
export const readStoredColorScheme = () => storageManager.get("light");
