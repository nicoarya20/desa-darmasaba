import { CSV_MAKS_BYTES } from "@/lib/csv/parse-csv";
import { parseCsvUmkm, type HasilCsvUmkm } from "@/lib/umkm/umkm-impor-csv";
import {
  bodyImporUmkm,
  bolehImpor,
  gabungPratinjau,
  pratinjauTanpaServer,
  type Pratinjau,
  type RespDryRun,
} from "@/lib/umkm/umkm-impor-pratinjau";
import type { ModeImporUmkm } from "@/lib/umkm/umkm-impor.rules";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import umkm from "./umkm";

type Tahap = "kosong" | "membaca" | "siap" | "mengimpor";
type Balasan = { success?: boolean; message?: string; data?: unknown };

/** POST ke endpoint impor; galat jaringan/server dikembalikan sebagai pesan (tidak melempar, tidak ada toast). */
async function panggil(body: unknown): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  try {
    const res = await fetch("/api/ekonomi/umkm/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const hasil = (await res.json().catch(() => ({}))) as Balasan;
    if (res.ok && hasil.success) return { ok: true, data: hasil.data };
    return { ok: false, message: hasil.message ?? `Server menolak permintaan (kode ${res.status})` };
  } catch {
    return { ok: false, message: "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi" };
  }
}

/** State modal impor CSV Data UMKM: berkas diparse di browser, pratinjau lewat dry-run, lalu impor sungguhan. */
const imporUmkm = proxy({
  mode: "lewati" as ModeImporUmkm,
  berkasNama: null as string | null,
  hasil: null as HasilCsvUmkm | null,
  pratinjau: null as Pratinjau | null,
  tahap: "kosong" as Tahap,
  error: null as string | null,
  // Penanda permintaan terbaru: jawaban dry-run yang basi (berkas/mode sudah diganti) diabaikan.
  versi: 0,

  reset() {
    this.mode = "lewati";
    this.berkasNama = null;
    this.hasil = null;
    this.pratinjau = null;
    this.tahap = "kosong";
    this.error = null;
    this.versi++;
  },

  async pilihBerkas(file: File | null) {
    const versi = ++this.versi;
    this.hasil = null;
    this.pratinjau = null;
    this.error = null;
    this.berkasNama = file?.name ?? null;
    if (!file) {
      this.tahap = "kosong";
      return;
    }
    if (!/\.csv$/i.test(file.name)) {
      this.error = "Berkas harus berformat .csv";
      this.tahap = "kosong";
      return;
    }
    if (file.size > CSV_MAKS_BYTES) {
      this.error = "Ukuran berkas maksimal 2 MB";
      this.tahap = "kosong";
      return;
    }
    this.tahap = "membaca";
    const teks = await file.text().catch(() => null);
    if (versi !== this.versi) return;
    if (teks === null) {
      this.error = "Berkas tidak dapat dibaca";
      this.tahap = "kosong";
      return;
    }
    const hasil = parseCsvUmkm(teks);
    this.hasil = hasil;
    if (hasil.galat) {
      this.tahap = "kosong";
      return;
    }
    await this.hitungPratinjau(versi);
  },

  async ubahMode(mode: ModeImporUmkm) {
    this.mode = mode;
    if (!this.hasil || this.hasil.galat) return;
    const versi = ++this.versi;
    this.error = null;
    this.tahap = "membaca";
    await this.hitungPratinjau(versi);
  },

  async hitungPratinjau(versi: number) {
    const hasil = this.hasil;
    if (!hasil) return;
    if (hasil.rows.length === 0) {
      this.pratinjau = pratinjauTanpaServer(hasil);
      this.tahap = "siap";
      return;
    }
    const balasan = await panggil(bodyImporUmkm(hasil.rows, this.mode, true));
    if (versi !== this.versi) return;
    if (balasan.ok) this.pratinjau = gabungPratinjau(hasil, balasan.data as RespDryRun);
    else {
      this.pratinjau = null;
      this.error = balasan.message;
    }
    this.tahap = "siap";
  },

  /** Impor sungguhan; true bila sukses (modal ditutup pemanggil). Galat tampil di modal, bukan toast. */
  async kirim(): Promise<boolean> {
    const hasil = this.hasil;
    if (!hasil || this.tahap !== "siap" || !bolehImpor(this.pratinjau)) return false;
    const versi = ++this.versi;
    this.tahap = "mengimpor";
    this.error = null;
    const balasan = await panggil(bodyImporUmkm(hasil.rows, this.mode, false));
    if (!balasan.ok) {
      this.error = balasan.message;
      await this.hitungPratinjau(versi);
      return false;
    }
    const r = balasan.data as { ditambah: number; diperbarui: number; dilewati: number };
    toast.success(`Impor selesai: ${r.ditambah} UMKM ditambah, ${r.diperbarui} diperbarui, ${r.dilewati} dilewati`);
    this.reset();
    umkm.findMany.load(1, 10, umkm.findMany.search);
    return true;
  },
});

export default imporUmkm;
