// State Valtio satu panel Sampah fitur (satu instance per panel): muat halaman, pulihkan, hapus permanen.
import { toast } from 'react-toastify';
import { proxy } from 'valtio';
import { SAMPAH_RETENSI_HARI } from '@/lib/sampah/sampah-retensi';
import { hapusPermanenSampahPanel, muatSampahPanel, pulihkanSampahPanel, type SampahPanelApiDeps } from './sampah-panel.api';
import {
  SAMPAH_PANEL_LIMIT,
  halamanSetelahItemHilangPanel,
  type SampahPanelItem,
  type SampahSumber,
} from './sampah-panel.logic';

/** Aksi per item yang sedang berjalan (untuk loading tombol). */
export type SampahPanelBusy = { id: string; aksi: 'pulihkan' | 'hapus' } | null;

type Notify = { success: (message: string) => void; error: (message: string) => void };

/** Dependensi yang bisa diganti di test (fetch + toast). */
export type SampahPanelDeps = SampahPanelApiDeps & { notify?: Notify };

/** Buat state panel Sampah untuk satu sumber (+ `scopeId` untuk dokumen APBDes). */
export function createSampahPanelState(target: { sumber: SampahSumber; scopeId?: string }, deps: SampahPanelDeps = {}) {
  const notify = deps.notify ?? toast;
  const api = { fetchImpl: deps.fetchImpl };
  // Nomor urut request daftar: respons lama (halaman sudah berganti) diabaikan agar tidak menimpa yang baru.
  let loadSeq = 0;

  const state = proxy({
    items: [] as SampahPanelItem[],
    total: 0,
    page: 1,
    limit: SAMPAH_PANEL_LIMIT,
    retensiHari: SAMPAH_RETENSI_HARI,
    /** True setelah muat pertama berhasil (jumlah di judul baru ditampilkan). */
    loaded: false,
    loading: false,
    /** Pesan gagal memuat terakhir (null = sukses). */
    error: null as string | null,
    busy: null as SampahPanelBusy,
    /** Item yang menunggu konfirmasi hapus permanen. */
    hapusTarget: null as SampahPanelItem | null,

    /** Muat satu halaman (bawaan: halaman aktif). */
    async load(page: number = state.page) {
      const seq = ++loadSeq;
      state.loading = true;
      const res = await muatSampahPanel(target.sumber, { scopeId: target.scopeId, page, limit: state.limit }, api);
      if (seq !== loadSeq) return;
      state.loading = false;
      if (!res.ok) {
        state.error = res.message;
        return;
      }
      state.items = res.data.items;
      state.total = res.data.total;
      state.page = res.data.page;
      state.retensiHari = res.data.retensiHari;
      state.error = null;
      state.loaded = true;
    },

    /** Pilih (atau batalkan dengan null) item untuk modal hapus permanen. */
    pilihHapus(item: SampahPanelItem | null) {
      state.hapusTarget = item;
    },

    /** Pulihkan item, muat ulang daftar, lalu panggil `onPulihkan` agar halaman induk memuat ulang datanya. */
    async pulihkan(item: SampahPanelItem, onPulihkan?: () => void): Promise<boolean> {
      state.busy = { id: item.id, aksi: 'pulihkan' };
      const res = await pulihkanSampahPanel(target.sumber, item.id, api);
      state.busy = null;
      if (!res.ok) {
        notify.error(res.message);
        return false;
      }
      notify.success(res.message ?? `"${item.judul}" dipulihkan`);
      await state.load(halamanSetelahItemHilangPanel(state.page, state.items.length));
      onPulihkan?.();
      return true;
    },

    /** Hapus permanen item yang sedang dikonfirmasi (`hapusTarget`), lalu muat ulang daftar. */
    async hapusPermanen(): Promise<boolean> {
      const item = state.hapusTarget;
      if (!item) return false;
      state.busy = { id: item.id, aksi: 'hapus' };
      const res = await hapusPermanenSampahPanel(target.sumber, item.id, api);
      state.busy = null;
      state.hapusTarget = null;
      if (!res.ok) {
        notify.error(res.message);
        return false;
      }
      notify.success(res.message ?? `"${item.judul}" dihapus permanen`);
      await state.load(halamanSetelahItemHilangPanel(state.page, state.items.length));
      return true;
    },
  });
  return state;
}

/** Instance state panel Sampah. */
export type SampahPanelState = ReturnType<typeof createSampahPanelState>;
