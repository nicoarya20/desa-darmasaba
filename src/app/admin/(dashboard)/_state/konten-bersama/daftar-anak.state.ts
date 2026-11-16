import { moveDokumen } from "@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/dokumen-draft";
import { getServerMessage } from "@/utils/api-message";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { hapusUnggahanYatim, unggahGambar } from "./unggah-gambar";

type Respons = { ok: boolean; body: unknown };

/** Kirim request JSON ke API daftar anak; `ok` = status 2xx dan bukan `{ success: false }`. */
async function kirim(url: string, method: string, body?: unknown): Promise<Respons> {
  const res = await fetch(url, {
    method,
    ...(body !== undefined && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  });
  // Body bukan JSON (mis. halaman error proxy) → diperlakukan kosong; status HTTP tetap menentukan `ok`.
  const json: unknown = await res.json().catch(() => null);
  const gagal = json !== null && typeof json === "object" && (json as { success?: unknown }).success === false;
  return { ok: res.ok && !gagal, body: json };
}

const pesanError = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

type Opsi = {
  /** URL daftar anak satu induk, mis. `(id) => \`/api/lingkungan/keteranganbankterdekat/${id}/pengurus\``. */
  url: (parentId: string) => string;
  /** Sebutan item di pesan toast, mis. "foto" / "pengurus". */
  label: string;
  /** Konteks log berkas yatim, mis. "galeri bank sampah". */
  tag: string;
};

/**
 * State admin daftar anak satu induk (galeri foto kegiatan / pengurus) di atas helper API bersama:
 * muat, tambah (opsional unggah foto dulu), ubah, hapus permanen, geser urutan. Satu instance per domain.
 */
export function createDaftarAnakState<T extends { id: string }>({ url, label, tag }: Opsi) {
  const state = proxy({
    parentId: null as string | null,
    data: [] as T[],
    loaded: false,

    /** Muat daftar milik induk; gagal → daftar kosong + toast (halaman tidak menggantung). */
    async load(parentId: string) {
      state.parentId = parentId;
      try {
        const res = await kirim(url(parentId), "GET");
        if (!res.ok) toast.error(getServerMessage(res.body) ?? `Gagal memuat daftar ${label}`);
        state.data = res.ok ? (((res.body as { data?: T[] })?.data ?? []) as T[]) : [];
      } catch (error) {
        toast.error(pesanError(error, `Gagal memuat daftar ${label}`));
        state.data = [];
      } finally {
        state.loaded = true;
      }
    },

    saving: false,
    /** Tambah item; `unggahanBaru` = id berkas yang baru diunggah untuk item ini (dibersihkan bila gagal). */
    async tambah(items: Record<string, unknown>[], unggahanBaru: readonly string[] = []): Promise<boolean> {
      if (!state.parentId || items.length === 0) return false;
      state.saving = true;
      try {
        const res = await kirim(url(state.parentId), "POST", { items });
        if (!res.ok) {
          await hapusUnggahanYatim(unggahanBaru, tag);
          toast.error(getServerMessage(res.body) ?? `Gagal menambahkan ${label}`);
          return false;
        }
        toast.success(getServerMessage(res.body) ?? `${label} berhasil ditambahkan`);
        await state.load(state.parentId);
        return true;
      } catch (error) {
        await hapusUnggahanYatim(unggahanBaru, tag);
        toast.error(pesanError(error, `Terjadi kesalahan saat menambahkan ${label}`));
        return false;
      } finally {
        state.saving = false;
      }
    },

    /** Unggah beberapa foto lalu daftarkan sekaligus (galeri). */
    async unggahFoto(files: readonly File[]): Promise<boolean> {
      if (files.length === 0) return false;
      const imageIds: string[] = [];
      state.saving = true;
      try {
        for (const file of files) imageIds.push(await unggahGambar(file));
      } catch (error) {
        state.saving = false;
        await hapusUnggahanYatim(imageIds, tag);
        toast.error(pesanError(error, "Terjadi kesalahan saat mengunggah foto"));
        return false;
      }
      return state.tambah(imageIds.map((imageId) => ({ imageId })), imageIds);
    },

    savingId: null as string | null,
    /** Ubah sebagian field satu item; `unggahanBaru` dibersihkan bila gagal. */
    async ubah(id: string, patch: Record<string, unknown>, unggahanBaru: readonly string[] = []): Promise<boolean> {
      if (!state.parentId) return false;
      state.savingId = id;
      try {
        const res = await kirim(`${url(state.parentId)}/${encodeURIComponent(id)}`, "PUT", patch);
        if (!res.ok) {
          await hapusUnggahanYatim(unggahanBaru, tag);
          toast.error(getServerMessage(res.body) ?? `Gagal menyimpan ${label}`);
          return false;
        }
        const baru = (res.body as { data?: T })?.data;
        if (baru) state.data = state.data.map((item) => (item.id === id ? baru : item));
        toast.success(getServerMessage(res.body) ?? `${label} berhasil disimpan`);
        return true;
      } catch (error) {
        await hapusUnggahanYatim(unggahanBaru, tag);
        toast.error(pesanError(error, `Terjadi kesalahan saat menyimpan ${label}`));
        return false;
      } finally {
        state.savingId = null;
      }
    },

    deleting: false,
    /** Hapus permanen satu item (berkasnya ikut dihapus server). */
    async hapus(id: string): Promise<boolean> {
      if (!state.parentId) return false;
      state.deleting = true;
      try {
        const res = await kirim(`${url(state.parentId)}/${encodeURIComponent(id)}`, "DELETE");
        if (!res.ok) {
          toast.error(getServerMessage(res.body) ?? `Gagal menghapus ${label}`);
          return false;
        }
        state.data = state.data.filter((item) => item.id !== id);
        toast.success(getServerMessage(res.body) ?? `${label} berhasil dihapus`);
        return true;
      } catch (error) {
        toast.error(pesanError(error, `Terjadi kesalahan saat menghapus ${label}`));
        return false;
      } finally {
        state.deleting = false;
      }
    },

    reordering: false,
    /** Geser item ke depan (-1) / belakang (+1) lalu simpan urutan; dimuat ulang dari server bila gagal. */
    async geser(index: number, direction: -1 | 1): Promise<boolean> {
      const parentId = state.parentId;
      const next = moveDokumen(state.data, index, direction);
      if (!parentId || next.every((item, i) => item === state.data[i])) return false;
      state.data = next;
      state.reordering = true;
      try {
        const res = await kirim(`${url(parentId)}/urutan`, "PUT", { ids: next.map((item) => item.id) });
        if (res.ok) return true;
        toast.error(getServerMessage(res.body) ?? `Gagal menyimpan urutan ${label}`);
      } catch (error) {
        toast.error(pesanError(error, `Terjadi kesalahan saat menyimpan urutan ${label}`));
      } finally {
        state.reordering = false;
      }
      await state.load(parentId);
      return false;
    },
  });
  return state;
}

export type DaftarAnakState<T extends { id: string }> = ReturnType<typeof createDaftarAnakState<T>>;
