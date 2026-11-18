import { uploadPdfFile } from "@/app/admin/_com/upload/pdf-upload";
import ApiFetch from "@/lib/api-fetch";
import { parseProdukHukumInput, type KategoriProdukHukum } from "@/lib/produk-hukum";
import { toast } from "react-toastify";
import { proxy } from "valtio";

/** Berkas PDF produk hukum dari API (tanpa path internal). */
export type ProdukHukumFile = { id: string; link: string; realName: string };

/** Satu produk hukum dari API (`file` null = belum ada PDF). */
export type ProdukHukumItem = {
  id: string;
  judul: string;
  nomor: string | null;
  tahun: number | null;
  kategori: string;
  file: ProdukHukumFile | null;
};

/** Isi form create/edit. `fileId`: undefined = berkas tidak diubah, string = berkas baru hasil unggah. */
export type ProdukHukumFormValues = {
  judul: string;
  nomor: string;
  tahun: number | null;
  kategori: KategoriProdukHukum;
  fileId: string | undefined;
};

const defaultForm = (): ProdukHukumFormValues => ({
  judul: "",
  nomor: "",
  tahun: null,
  kategori: "PERDES",
  fileId: undefined,
});

/** Jumlah baris per halaman daftar admin. */
export const PRODUK_HUKUM_ADMIN_PAGE_SIZE = 10;

const api = () => ApiFetch.api.desa.produkhukum;

/** Pesan galat dari respons Eden (`{ success: false, message }`), atau `fallback` bila tidak ada. */
function pesanGalat(res: { error: { value: unknown } | null }, fallback: string): string {
  const message = (res.error?.value as { message?: string } | undefined)?.message;
  return message ?? fallback;
}

/** Body kirim ke API dari isi form; `fileId` undefined tidak ikut terkirim (berkas lama dipertahankan). */
function toBody(form: ProdukHukumFormValues) {
  return { judul: form.judul, nomor: form.nomor, tahun: form.tahun, kategori: form.kategori, fileId: form.fileId };
}

/** Validasi form di klien dengan aturan yang sama dengan API; kembalikan pesan galat atau null. */
function validateForm(form: ProdukHukumFormValues): string | null {
  const cek = parseProdukHukumInput({ ...form });
  return cek.ok ? null : cek.message;
}

/** Unggah PDF terpilih (bila ada) dan simpan id-nya ke form; false bila unggah gagal (toast sudah tampil). */
async function attachPdf(form: ProdukHukumFormValues, pdf: File | null): Promise<boolean> {
  if (!pdf) return true;
  const fileId = await uploadPdfFile(pdf);
  if (!fileId) return false;
  form.fileId = fileId;
  return true;
}

// State admin CRUD Produk Hukum (/api/desa/produkhukum). Form di-reset/diisi IN-PLACE (Object.assign) agar identitas
// proxy `form` stabil bagi komponen yang memakai `useSnapshot(form, { sync: true })`.
const stateProdukHukum = proxy({
  findMany: {
    data: [] as ProdukHukumItem[],
    page: 1,
    totalPages: 1,
    loading: false,
    async load(page = 1, search = "", kategori = "") {
      const s = stateProdukHukum.findMany;
      s.loading = true;
      s.page = page;
      try {
        const query: Record<string, string | number> = { page, limit: PRODUK_HUKUM_ADMIN_PAGE_SIZE };
        if (search) query.q = search;
        if (kategori) query.kategori = kategori;
        const res = await api()["find-many"].get({ query });
        const body = res.data as { success?: boolean; data?: ProdukHukumItem[]; totalPages?: number } | null;
        if (res.status === 200 && body?.success) {
          s.data = body.data ?? [];
          s.totalPages = body.totalPages ?? 1;
        } else {
          s.data = [];
          s.totalPages = 1;
          toast.error(pesanGalat(res, "Gagal mengambil daftar produk hukum"));
        }
      } catch (error) {
        console.error("Gagal memuat produk hukum:", (error as Error).message);
        s.data = [];
        s.totalPages = 1;
        toast.error("Terjadi kesalahan saat mengambil daftar produk hukum");
      } finally {
        s.loading = false;
      }
    },
  },

  create: {
    form: defaultForm(),
    loading: false,
    reset() {
      Object.assign(stateProdukHukum.create.form, defaultForm());
    },
    /** Unggah PDF opsional lalu simpan; true bila tersimpan. */
    async submit(pdf: File | null): Promise<boolean> {
      const s = stateProdukHukum.create;
      const invalid = validateForm(s.form);
      if (invalid) {
        toast.error(invalid);
        return false;
      }
      s.loading = true;
      try {
        if (!(await attachPdf(s.form, pdf))) return false;
        const res = await api().create.post(toBody(s.form));
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal menyimpan produk hukum"));
          return false;
        }
        toast.success("Produk hukum berhasil disimpan");
        return true;
      } catch (error) {
        console.error("Gagal menyimpan produk hukum:", (error as Error).message);
        toast.error("Terjadi kesalahan saat menyimpan produk hukum");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: defaultForm(),
    currentFile: null as ProdukHukumFile | null,
    loading: false,
    /** Muat satu produk hukum ke form; true bila ditemukan. */
    async load(id: string): Promise<boolean> {
      const s = stateProdukHukum.edit;
      s.loading = true;
      try {
        const res = await api()({ id }).get();
        const item = (res.data as { success?: boolean; data?: ProdukHukumItem } | null)?.data;
        if (res.status !== 200 || !item) {
          toast.error(pesanGalat(res, "Produk hukum tidak ditemukan"));
          return false;
        }
        s.id = item.id;
        s.currentFile = item.file;
        Object.assign(s.form, {
          judul: item.judul,
          nomor: item.nomor ?? "",
          tahun: item.tahun,
          kategori: item.kategori as KategoriProdukHukum,
          fileId: undefined, // undefined = pertahankan PDF lama
        });
        return true;
      } catch (error) {
        console.error(`Gagal memuat produk hukum ${id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat memuat produk hukum");
        return false;
      } finally {
        s.loading = false;
      }
    },
    /** Unggah PDF baru (bila dipilih) lalu simpan perubahan; true bila tersimpan. */
    async submit(pdf: File | null): Promise<boolean> {
      const s = stateProdukHukum.edit;
      const invalid = validateForm(s.form);
      if (invalid) {
        toast.error(invalid);
        return false;
      }
      s.loading = true;
      try {
        if (!(await attachPdf(s.form, pdf))) return false;
        const res = await api().updt({ id: s.id }).put(toBody(s.form));
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal menyimpan perubahan"));
          return false;
        }
        toast.success("Produk hukum berhasil diubah");
        return true;
      } catch (error) {
        console.error(`Gagal mengubah produk hukum ${s.id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat menyimpan perubahan");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },

  delete: {
    loading: false,
    /** Hapus produk hukum beserta berkasnya; true bila terhapus (pemanggil memuat ulang daftar). */
    async byId(id: string): Promise<boolean> {
      const s = stateProdukHukum.delete;
      s.loading = true;
      try {
        const res = await api().del({ id }).delete();
        if (res.status !== 200) {
          toast.error(pesanGalat(res, "Gagal menghapus produk hukum"));
          return false;
        }
        toast.success("Produk hukum berhasil dihapus");
        return true;
      } catch (error) {
        console.error(`Gagal menghapus produk hukum ${id}:`, (error as Error).message);
        toast.error("Terjadi kesalahan saat menghapus produk hukum");
        return false;
      } finally {
        s.loading = false;
      }
    },
  },
});

export default stateProdukHukum;
