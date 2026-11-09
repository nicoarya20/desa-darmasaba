import { proxy } from "valtio";
import { toast } from "react-toastify";
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import type { MenuVisibilityRow } from "@/app/darmasaba/_com/menu-visibility.logic";

/** Satu perubahan yang dikirim ke API; isVisible null = kembali ke default config. */
export type MenuVisibilityChange = { menuKey: string; isVisible: boolean | null };

function toRecord(rows: readonly MenuVisibilityRow[]): Record<string, boolean> {
  return Object.fromEntries(rows.map((row) => [row.menuKey, row.isVisible]));
}

/** State halaman admin Pengaturan › Visibilitas Menu (override per href submenu publik). */
const menuVisibilityState = proxy({
  overrides: {} as Record<string, boolean>,
  loading: false,
  /** menuKey yang sedang disimpan (untuk loading per Switch); "*" = reset semua. */
  savingKey: null as string | null,

  async load() {
    menuVisibilityState.loading = true;
    try {
      const res = await ApiFetch.api["menu-visibility"].findMany.get();
      if (res.status === 200 && res.data?.success) {
        menuVisibilityState.overrides = toRecord(res.data.data);
      } else {
        toast.error(getServerMessage(res) ?? "Gagal memuat pengaturan visibilitas menu");
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan visibilitas menu:", err);
      toast.error("Gagal memuat pengaturan visibilitas menu");
    } finally {
      menuVisibilityState.loading = false;
    }
  },

  async save(changes: MenuVisibilityChange[], savingKey: string) {
    menuVisibilityState.savingKey = savingKey;
    try {
      const res = await ApiFetch.api["menu-visibility"].update.put({ items: changes });
      const rows = res.status === 200 && res.data?.success ? res.data.data : undefined;
      if (rows) {
        menuVisibilityState.overrides = toRecord(rows);
        toast.success("Visibilitas menu disimpan");
      } else {
        toast.error(getServerMessage(res) ?? "Gagal menyimpan visibilitas menu");
      }
    } catch (err) {
      console.error("Gagal menyimpan visibilitas menu:", err);
      toast.error("Gagal menyimpan visibilitas menu");
    } finally {
      menuVisibilityState.savingKey = null;
    }
  },
});

export default menuVisibilityState;
