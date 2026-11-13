import type { Metadata } from "next";
import { connection } from "next/server";
import { getMenuVisibilityOverrides } from "@/lib/menu-visibility.server";
import { DarmasabaShell } from "./(public)/_com/DarmasabaShell";
import { MenuVisibilityProvider } from "./(public)/_com/MenuVisibilityContext";
import { NotFoundContent } from "./(public)/_com/not-found/NotFoundContent";
import { NOT_FOUND_TEXT } from "./(public)/_com/not-found/not-found.text";

// robots menimpa "index, follow" dari root layout; tanpa ini halaman 404 membawa dua meta robots bertentangan.
export const metadata: Metadata = {
  title: NOT_FOUND_TEXT.metaTitle,
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

/**
 * 404 seluruh situs: URL tak dikenal, notFound() di halaman, dan submenu yang disembunyikan admin.
 * File ini dirender di bawah root layout, di luar layout publik, jadi kerangka navbar/footer dan
 * visibilitas menu dipasang sendiri di sini (sama seperti src/app/(public)/layout.tsx).
 */
export default async function NotFound() {
  // Per request, sama seperti layout publik: build Docker tak punya akses DB.
  await connection();
  const overrides = await getMenuVisibilityOverrides();
  return (
    <MenuVisibilityProvider overrides={overrides}>
      <DarmasabaShell>
        <NotFoundContent />
      </DarmasabaShell>
    </MenuVisibilityProvider>
  );
}
