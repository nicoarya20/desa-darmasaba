import { connection } from "next/server";
import { getMenuVisibilityOverrides } from "@/lib/menu-visibility.server";
import { DarmasabaShell } from "./_com/DarmasabaShell";
import { MenuVisibilityProvider } from "./_com/MenuVisibilityContext";
import { MenuVisibilityGuard } from "./_com/MenuVisibilityGuard";

/**
 * Layout publik: override visibilitas menu dibaca di server lalu ikut HTML pertama, jadi
 * navbar tidak "berkedip" dan halaman tersembunyi langsung 404 tanpa menunggu fetch client.
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  // Render per request (bukan prerender saat build): build Docker tidak punya akses DB, dan
  // pengaturan harus berlaku tanpa deploy ulang. Query-nya sendiri di-cache via tag.
  await connection();
  const overrides = await getMenuVisibilityOverrides();
  return (
    <MenuVisibilityProvider overrides={overrides}>
      <DarmasabaShell>
        <MenuVisibilityGuard>{children}</MenuVisibilityGuard>
      </DarmasabaShell>
    </MenuVisibilityProvider>
  );
}
