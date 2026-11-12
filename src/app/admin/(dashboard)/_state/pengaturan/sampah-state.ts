import { proxy } from "valtio";
import { toast } from "react-toastify";
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import type { SampahItem } from "@/lib/sampah/sampah-item";
import { SAMPAH_KELOMPOK_SEMUA, sampahKelompokList, type SampahKelompok } from "@/lib/sampah/sampah-kelompok";
import { SAMPAH_LIMIT_DEFAULT } from "@/lib/sampah/sampah-query";
import { halamanSetelahItemHilang } from "../../pengaturan/sampah/_lib/sampah-view.logic";

/** Aksi per item yang sedang berjalan (untuk loading tombol). */
export type SampahBusy = { id: string; aksi: "pulihkan" | "hapus" } | null;

// Nomor urut request daftar: respons lama (tab/cari sudah berganti) diabaikan agar tidak menimpa yang baru.
let loadSeq = 0;

const pesanGagal = (res: unknown, fallback: string) => getServerMessage(res) ?? fallback;

/** State halaman admin Pengaturan › Sampah (daftar per kelompok + jumlah, pulihkan, hapus permanen, kosongkan). */
const sampahState = proxy({
  kelompokAktif: SAMPAH_KELOMPOK_SEMUA,
  page: 1,
  limit: SAMPAH_LIMIT_DEFAULT,
  cari: "",
  items: [] as SampahItem[],
  /** Jumlah per kelompok (+ "semua"), mengikuti `cari`. */
  counts: {} as Record<string, number>,
  /** Urutan kelompok sidebar + "Lainnya"; diisi dari API, awalnya dari daftar lokal agar bar tab langsung lengkap. */
  kelompok: sampahKelompokList() as SampahKelompok[],
  total: 0,
  loading: false,
  /** Pesan gagal memuat terakhir (null = sukses). */
  error: null as string | null,
  busy: null as SampahBusy,
  kosongkanLoading: false,

  /** Muat halaman aktif + jumlah per kelompok. */
  async load() {
    const seq = ++loadSeq;
    sampahState.loading = true;
    const { kelompokAktif, page, limit, cari } = sampahState;
    try {
      const res = await ApiFetch.api.pengaturan.sampah.get({ query: { kelompok: kelompokAktif, page, limit, cari } });
      if (seq !== loadSeq) return;
      const body = res.data;
      if (body?.success && "data" in body) {
        sampahState.items = body.data.items;
        sampahState.counts = body.data.counts;
        sampahState.kelompok = body.data.kelompok;
        sampahState.total = body.data.total;
        sampahState.error = null;
      } else {
        sampahState.error = pesanGagal(res, "Gagal memuat Sampah");
        toast.error(sampahState.error);
      }
    } catch (err) {
      if (seq !== loadSeq) return;
      console.error(`Gagal memuat Sampah (kelompok ${kelompokAktif}, halaman ${page}):`, err);
      sampahState.error = "Gagal memuat Sampah";
      toast.error(sampahState.error);
    } finally {
      if (seq === loadSeq) sampahState.loading = false;
    }
  },

  /** Ganti tab kelompok → kembali ke halaman 1. */
  setKelompok(kelompokId: string) {
    sampahState.kelompokAktif = kelompokId;
    sampahState.page = 1;
    return sampahState.load();
  },

  setPage(page: number) {
    sampahState.page = page;
    return sampahState.load();
  },

  /** Ganti kata kunci pencarian → kembali ke halaman 1. */
  setCari(cari: string) {
    sampahState.cari = cari;
    sampahState.page = 1;
    return sampahState.load();
  },

  /** Pulihkan satu item lalu muat ulang daftar + jumlah. True bila berhasil. */
  pulihkan(item: SampahItem) {
    return aksiItem(item, "pulihkan", "Gagal memulihkan item", () =>
      ApiFetch.api.pengaturan.sampah({ id: encodeURIComponent(item.id) }).pulihkan.post(),
    );
  },

  /** Hapus permanen satu item lalu muat ulang daftar + jumlah. True bila berhasil. */
  hapusPermanen(item: SampahItem) {
    return aksiItem(item, "hapus", "Gagal menghapus permanen item", () =>
      ApiFetch.api.pengaturan.sampah({ id: encodeURIComponent(item.id) }).delete(),
    );
  },

  /** Kosongkan kelompok aktif ("semua" = seluruh Sampah), kembali ke halaman 1. True bila berhasil. */
  async kosongkan() {
    const kelompok = sampahState.kelompokAktif;
    sampahState.kosongkanLoading = true;
    try {
      const res = await ApiFetch.api.pengaturan.sampah.delete(undefined, { query: { kelompok } });
      if (!res.data?.success) {
        toast.error(pesanGagal(res, "Gagal mengosongkan Sampah"));
        return false;
      }
      toast.success(res.data.message);
      sampahState.page = 1;
      await sampahState.load();
      return true;
    } catch (err) {
      console.error(`Gagal mengosongkan Sampah kelompok ${kelompok}:`, err);
      toast.error("Gagal mengosongkan Sampah");
      return false;
    } finally {
      sampahState.kosongkanLoading = false;
    }
  },
});

type AksiResponse = { data: { success: boolean; message: string } | null; error: unknown };

/** Jalankan aksi satu item; sukses → toast pesan server, mundur halaman bila kosong, muat ulang. */
async function aksiItem(
  item: SampahItem,
  aksi: "pulihkan" | "hapus",
  fallback: string,
  request: () => Promise<AksiResponse>,
): Promise<boolean> {
  sampahState.busy = { id: item.id, aksi };
  try {
    const res = await request();
    if (!res.data?.success) {
      toast.error(pesanGagal(res, fallback));
      return false;
    }
    toast.success(res.data.message);
    sampahState.page = halamanSetelahItemHilang(sampahState.page, sampahState.items.length);
    await sampahState.load();
    return true;
  } catch (err) {
    console.error(`${fallback} ${item.id}:`, err);
    toast.error(fallback);
    return false;
  } finally {
    sampahState.busy = null;
  }
}

export default sampahState;
