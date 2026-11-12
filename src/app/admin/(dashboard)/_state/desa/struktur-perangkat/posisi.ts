import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import type { Posisi, PosisiForm } from "./types";

/** Validasi form jabatan di klien: hanya nama + hierarki wajib. */
export const templatePosisi = z.object({
  nama: z.string().trim().min(1, "Nama jabatan wajib diisi"),
  hierarki: z
    .number({ required_error: "Hierarki wajib diisi", invalid_type_error: "Hierarki wajib diisi" })
    .int("Hierarki harus bilangan bulat")
    .min(1, "Hierarki minimal 1"),
  deskripsi: z.string().optional(),
  urutan: z.number().int("Urutan harus bilangan bulat").min(0, "Urutan tidak boleh negatif").nullable().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
});

const defaultPosisiForm = (): PosisiForm => ({
  nama: "",
  deskripsi: "",
  hierarki: null,
  urutan: null,
  parentId: "",
  isActive: true,
});

const posisiApi = () => ApiFetch.api.desa.strukturperangkat.posisi;

/** Validasi form; tampilkan toast dan kembalikan null bila tidak valid. */
function validForm(form: PosisiForm) {
  const cek = templatePosisi.safeParse(form);
  if (cek.success) return cek.data;
  toast.error(cek.error.issues.map((issue) => issue.message).join("\n"));
  return null;
}

/** Body create dari form tervalidasi; `urutan` kosong tidak dikirim (server mengisi 0). */
function toPayload(data: z.infer<typeof templatePosisi>) {
  return {
    nama: data.nama,
    hierarki: data.hierarki,
    deskripsi: data.deskripsi ?? "",
    parentId: data.parentId ?? "",
    ...(data.urutan === null || data.urutan === undefined ? {} : { urutan: data.urutan }),
  };
}

/** State jabatan Struktur Perangkat Desa: list semua, detail, create/update/delete (admin). */
const posisi = proxy({
  findManyAll: {
    data: null as Posisi[] | null,
    loading: false,
    /** Filter terakhir, dipakai ulang saat refresh setelah create/update/delete. */
    isActive: undefined as boolean | undefined,
    async load(isActive?: boolean) {
      posisi.findManyAll.loading = true;
      posisi.findManyAll.isActive = isActive;
      try {
        const res = await posisiApi()["find-many-all"].get({
          query: isActive === undefined ? {} : { isActive: String(isActive) },
        });
        posisi.findManyAll.data = res.status === 200 && res.data?.success ? res.data.data : [];
        if (res.status !== 200) toast.error(getServerMessage(res) ?? "Gagal memuat daftar jabatan");
      } catch (error) {
        console.error("[strukturPerangkat.posisi] Gagal memuat daftar jabatan:", error);
        posisi.findManyAll.data = [];
        toast.error("Terjadi kesalahan saat memuat daftar jabatan");
      } finally {
        posisi.findManyAll.loading = false;
      }
    },
  },

  findUnique: {
    data: null as Posisi | null,
    loading: false,
    async load(id: string): Promise<Posisi | null> {
      posisi.findUnique.loading = true;
      try {
        const res = await posisiApi()({ id }).get();
        const item = res.status === 200 && res.data?.success ? res.data.data : null;
        posisi.findUnique.data = item;
        if (!item) toast.error(getServerMessage(res) ?? "Jabatan tidak ditemukan");
        return item;
      } catch (error) {
        console.error(`[strukturPerangkat.posisi] Gagal memuat jabatan ${id}:`, error);
        posisi.findUnique.data = null;
        toast.error("Terjadi kesalahan saat memuat jabatan");
        return null;
      } finally {
        posisi.findUnique.loading = false;
      }
    },
  },

  create: {
    form: defaultPosisiForm(),
    loading: false,
    /** Kirim form create; true bila berhasil (form direset dan daftar dimuat ulang). */
    async submit(): Promise<boolean> {
      const data = validForm(posisi.create.form);
      if (!data) return false;
      posisi.create.loading = true;
      try {
        const res = await posisiApi().create.post(toPayload(data));
        if (res.status !== 200) {
          toast.error(getServerMessage(res) ?? "Gagal menambahkan jabatan");
          return false;
        }
        toast.success("Jabatan berhasil ditambahkan");
        posisi.create.resetForm();
        await posisi.findManyAll.load(posisi.findManyAll.isActive);
        return true;
      } catch (error) {
        console.error("[strukturPerangkat.posisi] Gagal menambahkan jabatan:", error);
        toast.error("Terjadi kesalahan saat menambahkan jabatan");
        return false;
      } finally {
        posisi.create.loading = false;
      }
    },
    resetForm() {
      posisi.create.form = defaultPosisiForm();
    },
  },

  update: {
    id: "",
    form: defaultPosisiForm(),
    loading: false,
    /** Muat jabatan ke form edit; false bila tidak ditemukan. */
    async load(id: string): Promise<boolean> {
      const item = await posisi.findUnique.load(id);
      if (!item) return false;
      posisi.update.id = item.id;
      posisi.update.form = {
        nama: item.nama,
        deskripsi: item.deskripsi ?? "",
        hierarki: item.hierarki,
        urutan: item.urutan,
        parentId: item.parentId ?? "",
        isActive: item.isActive,
      };
      return true;
    },
    /** Kirim form edit; true bila berhasil. 400 (atasan siklus/diri sendiri) tampil sebagai toast pesan server. */
    async submit(): Promise<boolean> {
      const { id, form } = posisi.update;
      const data = validForm(form);
      if (!id || !data) return false;
      posisi.update.loading = true;
      try {
        const res = await posisiApi()({ id }).put({ ...toPayload(data), isActive: form.isActive });
        if (res.status !== 200) {
          toast.error(getServerMessage(res) ?? "Gagal memperbarui jabatan");
          return false;
        }
        toast.success("Jabatan berhasil diperbarui");
        await posisi.findManyAll.load(posisi.findManyAll.isActive);
        return true;
      } catch (error) {
        console.error(`[strukturPerangkat.posisi] Gagal memperbarui jabatan ${id}:`, error);
        toast.error("Terjadi kesalahan saat memperbarui jabatan");
        return false;
      } finally {
        posisi.update.loading = false;
      }
    },
    resetForm() {
      posisi.update.id = "";
      posisi.update.form = defaultPosisiForm();
    },
  },

  delete: {
    loading: false,
    /** Hapus jabatan; 409 (masih punya pegawai/bawahan) tampil sebagai toast pesan server. */
    async byId(id: string): Promise<boolean> {
      posisi.delete.loading = true;
      try {
        const res = await posisiApi().del({ id }).delete();
        if (res.status !== 200) {
          toast.error(getServerMessage(res) ?? "Gagal menghapus jabatan");
          return false;
        }
        toast.success("Jabatan berhasil dihapus");
        await posisi.findManyAll.load(posisi.findManyAll.isActive);
        return true;
      } catch (error) {
        console.error(`[strukturPerangkat.posisi] Gagal menghapus jabatan ${id}:`, error);
        toast.error("Terjadi kesalahan saat menghapus jabatan");
        return false;
      } finally {
        posisi.delete.loading = false;
      }
    },
  },
});

export default posisi;
