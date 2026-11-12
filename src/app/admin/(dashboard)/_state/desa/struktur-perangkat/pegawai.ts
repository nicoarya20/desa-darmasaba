import ApiFetch from "@/lib/api-fetch";
import { formatDateOnly, parseOptionalDate, parseOptionalEmail } from "@/lib/struktur-organisasi";
import { getServerMessage } from "@/utils/api-message";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import type { Pegawai, PegawaiForm } from "./types";

/** Validasi form pegawai di klien: hanya nama lengkap + jabatan wajib; email & tanggal dicek bila diisi. */
export const templatePegawai = z.object({
  namaLengkap: z.string().trim().min(1, "Nama lengkap wajib diisi"),
  posisiId: z.string().trim().min(1, "Jabatan wajib dipilih"),
  gelarAkademik: z.string().optional(),
  imageId: z.string().optional(),
  tanggalMasuk: z.string().optional().superRefine((value, ctx) => {
    const result = parseOptionalDate(value);
    if (!result.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message });
  }),
  email: z.string().optional().superRefine((value, ctx) => {
    const result = parseOptionalEmail(value);
    if (!result.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message });
  }),
  telepon: z.string().optional(),
  alamat: z.string().optional(),
  isActive: z.boolean().optional(),
});

const defaultPegawaiForm = (): PegawaiForm => ({
  namaLengkap: "",
  gelarAkademik: "",
  imageId: "",
  tanggalMasuk: "",
  email: "",
  telepon: "",
  alamat: "",
  posisiId: "",
  isActive: true,
});

const pegawaiApi = () => ApiFetch.api.desa.strukturperangkat.pegawai;

/** Validasi form lalu bentuk body kontrak (semua field dikirim; kosong = dikosongkan server). Null bila tidak valid. */
function toPayload(form: PegawaiForm) {
  const cek = templatePegawai.safeParse(form);
  if (!cek.success) {
    toast.error(cek.error.issues.map((issue) => issue.message).join("\n"));
    return null;
  }
  return { ...form, namaLengkap: form.namaLengkap.trim(), posisiId: form.posisiId.trim() };
}

/** State pegawai Struktur Perangkat Desa: list berpaginasi, detail, create/update/delete (admin). */
const pegawai = proxy({
  findMany: {
    data: null as Pegawai[] | null,
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    search: "",
    isActive: undefined as boolean | undefined,
    loading: false,
    /** Muat satu halaman; parameter disimpan agar refresh setelah create/update/delete memakai filter yang sama. */
    async load(page = 1, limit = 10, search = "", isActive?: boolean) {
      Object.assign(pegawai.findMany, { loading: true, page, limit, search, isActive });
      try {
        const res = await pegawaiApi()["find-many"].get({
          query: {
            page,
            limit,
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(isActive === undefined ? {} : { isActive: String(isActive) }),
          },
        });
        const body = res.status === 200 && res.data?.success ? res.data : null;
        if (!body) toast.error(getServerMessage(res) ?? "Gagal memuat daftar perangkat desa");
        pegawai.findMany.data = body?.data ?? [];
        pegawai.findMany.total = body?.total ?? 0;
        pegawai.findMany.totalPages = body?.totalPages ?? 1;
      } catch (error) {
        console.error("[strukturPerangkat.pegawai] Gagal memuat daftar perangkat desa:", error);
        Object.assign(pegawai.findMany, { data: [], total: 0, totalPages: 1 });
        toast.error("Terjadi kesalahan saat memuat daftar perangkat desa");
      } finally {
        pegawai.findMany.loading = false;
      }
    },
    /** Muat ulang dengan page/limit/search/isActive terakhir. */
    async reload() {
      const { page, limit, search, isActive } = pegawai.findMany;
      await pegawai.findMany.load(page, limit, search, isActive);
    },
  },

  findUnique: {
    data: null as Pegawai | null,
    loading: false,
    async load(id: string): Promise<Pegawai | null> {
      pegawai.findUnique.loading = true;
      try {
        const res = await pegawaiApi()({ id }).get();
        const item = res.status === 200 && res.data?.success ? res.data.data : null;
        pegawai.findUnique.data = item;
        if (!item) toast.error(getServerMessage(res) ?? "Perangkat desa tidak ditemukan");
        return item;
      } catch (error) {
        console.error(`[strukturPerangkat.pegawai] Gagal memuat perangkat desa ${id}:`, error);
        pegawai.findUnique.data = null;
        toast.error("Terjadi kesalahan saat memuat perangkat desa");
        return null;
      } finally {
        pegawai.findUnique.loading = false;
      }
    },
  },

  create: {
    form: defaultPegawaiForm(),
    loading: false,
    /** Kirim form create; true bila berhasil (form direset dan daftar dimuat ulang). */
    async submit(): Promise<boolean> {
      const payload = toPayload(pegawai.create.form);
      if (!payload) return false;
      pegawai.create.loading = true;
      try {
        const res = await pegawaiApi().create.post(payload);
        if (res.status !== 200) {
          toast.error(getServerMessage(res) ?? "Gagal menambahkan perangkat desa");
          return false;
        }
        toast.success("Perangkat desa berhasil ditambahkan");
        pegawai.create.resetForm();
        await pegawai.findMany.reload();
        return true;
      } catch (error) {
        console.error("[strukturPerangkat.pegawai] Gagal menambahkan perangkat desa:", error);
        toast.error("Terjadi kesalahan saat menambahkan perangkat desa");
        return false;
      } finally {
        pegawai.create.loading = false;
      }
    },
    resetForm() {
      pegawai.create.form = defaultPegawaiForm();
    },
  },

  update: {
    id: "",
    form: defaultPegawaiForm(),
    /** Link foto saat ini untuk pratinjau form edit; null bila belum ada foto. */
    imageLink: null as string | null,
    loading: false,
    /** Muat pegawai ke form edit; false bila tidak ditemukan. */
    async load(id: string): Promise<boolean> {
      const item = await pegawai.findUnique.load(id);
      if (!item) return false;
      pegawai.update.id = item.id;
      pegawai.update.imageLink = item.image?.link ?? null;
      pegawai.update.form = {
        namaLengkap: item.namaLengkap,
        gelarAkademik: item.gelarAkademik ?? "",
        imageId: item.imageId ?? "",
        tanggalMasuk: formatDateOnly(item.tanggalMasuk),
        email: item.email ?? "",
        telepon: item.telepon ?? "",
        alamat: item.alamat ?? "",
        posisiId: item.posisiId,
        isActive: item.isActive,
      };
      return true;
    },
    /** Kirim form edit; imageId dikosongkan/diganti → server menghapus foto lama. True bila berhasil. */
    async submit(): Promise<boolean> {
      const { id } = pegawai.update;
      const payload = id ? toPayload(pegawai.update.form) : null;
      if (!payload) return false;
      pegawai.update.loading = true;
      try {
        const res = await pegawaiApi()({ id }).put(payload);
        if (res.status !== 200) {
          toast.error(getServerMessage(res) ?? "Gagal memperbarui perangkat desa");
          return false;
        }
        toast.success("Perangkat desa berhasil diperbarui");
        await pegawai.findMany.reload();
        return true;
      } catch (error) {
        console.error(`[strukturPerangkat.pegawai] Gagal memperbarui perangkat desa ${id}:`, error);
        toast.error("Terjadi kesalahan saat memperbarui perangkat desa");
        return false;
      } finally {
        pegawai.update.loading = false;
      }
    },
    resetForm() {
      Object.assign(pegawai.update, { id: "", imageLink: null, form: defaultPegawaiForm() });
    },
  },

  delete: {
    loading: false,
    /** Hapus pegawai beserta fotonya; true bila berhasil. */
    async byId(id: string): Promise<boolean> {
      pegawai.delete.loading = true;
      try {
        const res = await pegawaiApi().del({ id }).delete();
        if (res.status !== 200) {
          toast.error(getServerMessage(res) ?? "Gagal menghapus perangkat desa");
          return false;
        }
        toast.success("Perangkat desa berhasil dihapus");
        await pegawai.findMany.reload();
        return true;
      } catch (error) {
        console.error(`[strukturPerangkat.pegawai] Gagal menghapus perangkat desa ${id}:`, error);
        toast.error("Terjadi kesalahan saat menghapus perangkat desa");
        return false;
      } finally {
        pegawai.delete.loading = false;
      }
    },
  },
});

export default pegawai;
