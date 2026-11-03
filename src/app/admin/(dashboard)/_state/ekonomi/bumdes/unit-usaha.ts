import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { uploadBumdesImage } from "./bumdes-image";

export type UnitUsahaData = {
  id: string;
  nama: string;
  deskripsi: string;
  urutan: number;
  isActive: boolean;
  imageId: string | null;
  image: { id: string; name: string; link: string } | null;
};

const templateUnitUsaha = z.object({
  nama: z.string().trim().min(1, "Nama unit usaha wajib diisi"),
  deskripsi: z.string().trim().min(1, "Deskripsi wajib diisi"),
});

export type UnitUsahaForm = {
  nama: string;
  deskripsi: string;
  urutan: number | null;
  isActive: boolean;
};

const unitUsahaDefaultForm: UnitUsahaForm = { nama: "", deskripsi: "", urutan: null, isActive: true };

/** State unit usaha BUMDes: list berpaginasi (publik + admin), create/edit/delete (admin). */
const unitUsahaBumdes = proxy({
  findMany: {
    data: null as UnitUsahaData[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    /** `includeInactive` true untuk admin agar unit nonaktif tetap terlihat. */
    async load(page = 1, limit = 10, search = "", includeInactive = false) {
      unitUsahaBumdes.findMany.loading = true;
      try {
        const res = await ApiFetch.api.ekonomi.bumdes["unit-usaha"]["find-many"].get({
          query: {
            page,
            limit,
            ...(search ? { search } : {}),
            ...(includeInactive ? { includeInactive: "true" } : {}),
          },
        });
        const body = res.status === 200 ? res.data : null;
        unitUsahaBumdes.findMany.data = (body?.data as UnitUsahaData[] | undefined) ?? [];
        unitUsahaBumdes.findMany.page = body?.page ?? page;
        unitUsahaBumdes.findMany.total = body?.total ?? 0;
        unitUsahaBumdes.findMany.totalPages = body?.totalPages ?? 1;
      } catch {
        // Gagal jaringan diperlakukan sebagai daftar kosong agar halaman tidak menggantung di skeleton.
        unitUsahaBumdes.findMany.data = [];
        unitUsahaBumdes.findMany.total = 0;
        unitUsahaBumdes.findMany.totalPages = 1;
      } finally {
        unitUsahaBumdes.findMany.loading = false;
      }
    },
  },

  form: { ...unitUsahaDefaultForm },
  editId: "",
  currentImageUrl: null as string | null,
  currentImageId: null as string | null,
  loading: false,
  resetForm() {
    unitUsahaBumdes.form = { ...unitUsahaDefaultForm };
    unitUsahaBumdes.editId = "";
    unitUsahaBumdes.currentImageUrl = null;
    unitUsahaBumdes.currentImageId = null;
  },

  /** Muat satu unit usaha ke form edit; mengembalikan false bila tidak ditemukan. */
  async loadForEdit(id: string): Promise<boolean> {
    const res = await ApiFetch.api.ekonomi.bumdes["unit-usaha"]({ id }).get();
    const item = res.status === 200 ? (res.data?.data as UnitUsahaData | undefined) : undefined;
    if (!item) {
      toast.error(getServerMessage(res) ?? "Unit usaha tidak ditemukan");
      return false;
    }
    unitUsahaBumdes.editId = item.id;
    unitUsahaBumdes.currentImageId = item.imageId;
    unitUsahaBumdes.currentImageUrl = item.image?.link ?? null;
    unitUsahaBumdes.form = {
      nama: item.nama,
      deskripsi: item.deskripsi,
      urutan: item.urutan,
      isActive: item.isActive,
    };
    return true;
  },

  /** Simpan form: create bila `editId` kosong, update bila terisi. Mengembalikan true bila berhasil. */
  async submit(newImage: File | null): Promise<boolean> {
    const { form, editId } = unitUsahaBumdes;
    const cek = templateUnitUsaha.safeParse(form);
    if (!cek.success) {
      toast.error(cek.error.issues.map((i) => i.message).join("\n"));
      return false;
    }

    unitUsahaBumdes.loading = true;
    try {
      const imageId = newImage ? await uploadBumdesImage(newImage) : unitUsahaBumdes.currentImageId;
      const payload = {
        nama: cek.data.nama,
        deskripsi: cek.data.deskripsi,
        imageId,
        isActive: form.isActive,
        ...(form.urutan === null ? {} : { urutan: form.urutan }),
      };
      const api = ApiFetch.api.ekonomi.bumdes["unit-usaha"];
      const res = editId ? await api({ id: editId }).put(payload) : await api.create.post(payload);
      if (res.status !== 200) {
        toast.error(getServerMessage(res) ?? "Gagal menyimpan unit usaha");
        return false;
      }
      toast.success(editId ? "Unit usaha berhasil diperbarui" : "Unit usaha berhasil ditambahkan");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan unit usaha");
      return false;
    } finally {
      unitUsahaBumdes.loading = false;
    }
  },

  delete: {
    loading: false,
    /** Hapus (soft delete) satu unit usaha; mengembalikan true bila berhasil. */
    async byId(id: string): Promise<boolean> {
      unitUsahaBumdes.delete.loading = true;
      try {
        const res = await ApiFetch.api.ekonomi.bumdes["unit-usaha"].del({ id }).delete();
        if (res.status !== 200) {
          toast.error(getServerMessage(res) ?? "Gagal menghapus unit usaha");
          return false;
        }
        toast.success("Unit usaha berhasil dihapus");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus unit usaha");
        return false;
      } finally {
        unitUsahaBumdes.delete.loading = false;
      }
    },
  },
});

export default unitUsahaBumdes;
