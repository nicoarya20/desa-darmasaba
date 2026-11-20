import { uploadImageFile } from "@/app/admin/_com/upload/image-upload";
import ApiFetch from "@/lib/api-fetch";
import {
  parseLembagaKomunitasInput,
  type LembagaKomunitasFotoRef,
  type LembagaKomunitasRecord,
} from "@/lib/lembaga-komunitas";
import { toast } from "react-toastify";
import { proxy } from "valtio";

/** Satu lembaga dari API (`foto` null = belum ada foto). */
export type LembagaKomunitasItem = LembagaKomunitasRecord;

/** Foto lembaga dari API (tanpa path internal). */
export type LembagaKomunitasFoto = LembagaKomunitasFotoRef;

/** Isi form create/edit. `urutan` boleh "" saat input dikosongkan (dikirim sebagai 0). */
export type LembagaKomunitasFormValues = {
  nama: string;
  jenis: string;
  ketua: string;
  kontak: string;
  deskripsi: string;
  urutan: number | "";
};

/** Pilihan foto di form: `file` = gambar baru yang dipilih, `hapus` = lepas foto tersimpan (tanpa pengganti). */
export type FotoPilihan = { file: File | null; hapus: boolean };

const defaultForm = (): LembagaKomunitasFormValues => ({ nama: "", jenis: "", ketua: "", kontak: "", deskripsi: "", urutan: 0 });

/** Jumlah baris per halaman daftar admin. */
export const LEMBAGA_KOMUNITAS_ADMIN_PAGE_SIZE = 10;

const api = () => ApiFetch.api.desa.lembagakomunitas;

/** Pesan galat dari respons Eden (`{ success: false, message }`), atau `fallback` bila tidak ada. */
function pesanGalat(res: { error: { value: unknown } | null }, fallback: string): string {
  const message = (res.error?.value as { message?: string } | undefined)?.message;
  return message ?? fallback;
}

/** Body kirim ke API: `fotoId` undefined = tidak ikut terkirim (foto lama dipertahankan), null = lepas foto. */
type LembagaKomunitasBody = Omit<LembagaKomunitasFormValues, "urutan"> & { urutan: number; fotoId?: string | null };

/** Isi form → body API (urutan kosong dihitung 0); `fotoId` ditentukan pemanggil. */
function toBody(form: LembagaKomunitasFormValues, fotoId?: string | null): LembagaKomunitasBody {
  return { ...form, urutan: form.urutan === "" ? 0 : form.urutan, ...(fotoId === undefined ? {} : { fotoId }) };
}

/**
 * Validasi form di klien dengan aturan yang sama dengan API, lalu tentukan `fotoId`: gambar baru diunggah (null bila
 * gagal, toast sudah tampil), `hapus` → null (lepas), selain itu undefined (foto tidak diubah). Mengembalikan body
 * siap kirim, atau null bila ada yang gagal.
 */
async function siapkanBody(form: LembagaKomunitasFormValues, foto: FotoPilihan): Promise<LembagaKomunitasBody | null> {
  const cek = parseLembagaKomunitasInput(toBody(form));
  if (!cek.ok) {
    toast.error(cek.message);
    return null;
  }
  if (foto.file) {
    const fotoId = await uploadImageFile(foto.file);
    return fotoId ? toBody(form, fotoId) : null;
  }
  return toBody(form, foto.hapus ? null : undefined);
}

// State admin CRUD Lembaga & Komunitas (/api/desa/lembagakomunitas). Form di-reset/diisi IN-PLACE (Object.assign) agar
// identitas proxy `form` stabil bagi komponen yang memakai `useSnapshot(form, { sync: true })`.
const stateLembagaKomunitas = proxy({
  findMany: {
    data: [] as LembagaKomunitasItem[],
    page: 1,
    totalPages: 1,
    loading: false,
    async load(page = 1, search = "", jenis = "") {
      const s = stateLembagaKomunitas.findMany;
      s.loading = true;
      s.page = page;
      try {
        const query: Record<string, string | number> = { page, limit: LEMBAGA_KOMUNITAS_ADMIN_PAGE_SIZE };
        if (search) query.q = search;
        if (jenis) query.jenis = jenis;
        const res = await api()["find-many"].get({ query });
        const body = res.data as { success?: boolean; data?: LembagaKomunitasItem[]; totalPages?: number } | null;
        if (res.status === 200 && body?.success) {
          s.data = body.data ?? [];
          s.totalPages = body.totalPages ?? 1;
        } else {
          s.data = [];
          s.totalPages = 1;
          toast.error(pesanGalat(res, "Gagal mengambil daftar Lembaga & Komunitas"));
        }
      } catch (error) {
        console.error("Gagal memuat Lembaga & Komunitas:", (error as Error).message);
        s.data = [];
        s.totalPages = 1;
        toast.error("Terjadi kesalahan saat mengambil daftar Lembaga & Komunitas");
      } finally {
        s.loading = false;
      }
    },
  },

  /** Jenis yang sudah dipakai (saran isian form & pilihan filter). Gagal memuat tidak menghalangi form: saran kosong. */
  jenis: {
    data: [] as string[],
    async load() {
      try {
        const res = await api().jenis.get();
        const body = res.data as { success?: boolean; data?: string[] } | null;
        stateLembagaKomunitas.jenis.data = res.status === 200 && body?.success ? (body.data ?? []) : [];
      } catch (error) {
        console.error("Gagal memuat jenis Lembaga & Komunitas:", (error as Error).message);
        stateLembagaKomunitas.jenis.data = [];
      }
    },
  },

  create: {
    form: defaultForm(),
    loading: false,
    reset() {
      Object.assign(stateLembagaKomunitas.create.form, defaultForm());
    },
    /** Validasi, unggah foto opsional, lalu simpan; true bila tersimpan. */
    async submit(foto: FotoPilihan): Promise<boolean> {
      const s = stateLembagaKomunitas.create;
      s.loading = true;
      try {
        const body = await siapkanBody(s.form, foto);
        if (!body) return false;
        const res = await api().create.post(body);
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal menyimpan Lembaga & Komunitas"));
          return false;
        }
        toast.success("Lembaga atau komunitas berhasil disimpan");
        return true;
      } catch (error) {
        console.error("Gagal menyimpan Lembaga & Komunitas:", (error as Error).message);
        toast.error("Terjadi kesalahan saat menyimpan Lembaga & Komunitas");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: defaultForm(),
    currentFoto: null as LembagaKomunitasFoto | null,
    loading: false,
    /** Muat satu lembaga ke form; true bila ditemukan. */
    async load(id: string): Promise<boolean> {
      const s = stateLembagaKomunitas.edit;
      s.loading = true;
      try {
        const res = await api()({ id }).get();
        const item = (res.data as { success?: boolean; data?: LembagaKomunitasItem } | null)?.data;
        if (res.status !== 200 || !item) {
          toast.error(pesanGalat(res, "Lembaga atau komunitas tidak ditemukan"));
          return false;
        }
        s.id = item.id;
        s.currentFoto = item.foto;
        Object.assign(s.form, {
          nama: item.nama,
          jenis: item.jenis,
          ketua: item.ketua ?? "",
          kontak: item.kontak ?? "",
          deskripsi: item.deskripsi ?? "",
          urutan: item.urutan,
        });
        return true;
      } catch (error) {
        console.error(`Gagal memuat Lembaga & Komunitas ${id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat memuat Lembaga & Komunitas");
        return false;
      } finally {
        s.loading = false;
      }
    },
    /** Validasi, unggah foto baru bila dipilih, lalu simpan perubahan; true bila tersimpan. */
    async submit(foto: FotoPilihan): Promise<boolean> {
      const s = stateLembagaKomunitas.edit;
      s.loading = true;
      try {
        const body = await siapkanBody(s.form, foto);
        if (!body) return false;
        const res = await api().updt({ id: s.id }).put(body);
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal menyimpan perubahan"));
          return false;
        }
        toast.success("Lembaga atau komunitas berhasil diubah");
        return true;
      } catch (error) {
        console.error(`Gagal mengubah Lembaga & Komunitas ${s.id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat menyimpan perubahan");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  delete: {
    loading: false,
    /** Hapus (soft) satu lembaga; true bila terhapus (pemanggil memuat ulang daftar). */
    async byId(id: string): Promise<boolean> {
      const s = stateLembagaKomunitas.delete;
      s.loading = true;
      try {
        const res = await api().del({ id }).delete();
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal menghapus Lembaga & Komunitas"));
          return false;
        }
        toast.success("Lembaga atau komunitas berhasil dihapus");
        return true;
      } catch (error) {
        console.error(`Gagal menghapus Lembaga & Komunitas ${id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat menghapus Lembaga & Komunitas");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },
});

export default stateLembagaKomunitas;
