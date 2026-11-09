/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { DokumenInput } from "@/lib/desa-anti-korupsi-dokumen";
import type { FolderInput, FolderRef } from "@/lib/desa-anti-korupsi-folder";
import type {
  DesaAntiKorupsiDetail,
  DesaAntiKorupsiRingkas,
} from "@/lib/desa-anti-korupsi-view";
import { getServerMessage } from "@/utils/api-message";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateDesaAntikorupsi = z.object({
  name: z.string().min(1, "Judul harus diisi"),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  kategoriId: z.string().min(1, "Kategori harus dipilih"),
});

type FormDesaAntikorupsi = {
  name: string;
  deskripsi: string;
  kategoriId: string;
  folders: FolderInput[]; // set folder final; urutan = posisi di daftar
  dokumen: DokumenInput[]; // set dokumen final; urutan = posisi di dalam foldernya
};

const defaultDesaAntikorupsi = (): FormDesaAntikorupsi => ({
  name: "",
  deskripsi: "",
  kategoriId: "",
  folders: [],
  dokumen: [],
});

/** Isi form edit dari detail program: folder tersimpan (id) + dokumen dengan rujukan foldernya. */
function isiFormFromDetail(data: DesaAntiKorupsiDetail): Pick<FormDesaAntikorupsi, "folders" | "dokumen"> {
  const toInput = (d: DesaAntiKorupsiDetail["dokumenUmum"][number], folder: FolderRef): DokumenInput => ({
    id: d.id,
    fileId: d.fileId,
    judul: d.judul,
    urutan: d.urutan,
    folder,
  });
  return {
    folders: data.folders.map((f) => ({ id: f.id, nama: f.nama, urutan: f.urutan })),
    dokumen: [
      ...data.folders.flatMap((f) => f.dokumen.map((d) => toInput(d, { id: f.id }))),
      ...data.dokumenUmum.map((d) => toInput(d, null)),
    ],
  };
}

const desaAntikorupsi = proxy({
  create: {
    form: defaultDesaAntikorupsi(),
    loading: false,
    async create() {
      const cek = templateDesaAntikorupsi.safeParse(desaAntikorupsi.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        desaAntikorupsi.create.loading = true;
        const res = await ApiFetch.api.landingpage.desaantikorupsi[
          "create"
        ].post(desaAntikorupsi.create.form);
        if (res.status === 200) {
          desaAntikorupsi.findMany.load();
          return toast.success("Data Berhasil Dibuat");
        }
        return toast.error(
          getServerMessage(res) || "Gagal menambahkan desa antikorupsi"
        );
      } catch (error) {
        console.log(error);
        return toast.error("Gagal menambahkan desa antikorupsi");
      } finally {
        desaAntikorupsi.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as DesaAntiKorupsiRingkas[], // ringkas: jumlahFolder & jumlahDokumen, tanpa isi dokumen
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      desaAntikorupsi.findMany.loading = true;
      desaAntikorupsi.findMany.page = page;
      desaAntikorupsi.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.landingpage.desaantikorupsi[
          "findMany"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          desaAntikorupsi.findMany.data = res.data.data ?? [];
          desaAntikorupsi.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          desaAntikorupsi.findMany.data = [];
          desaAntikorupsi.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch desa antikorupsi:", err);
        desaAntikorupsi.findMany.data = [];
        desaAntikorupsi.findMany.totalPages = 1;
      } finally {
        desaAntikorupsi.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as DesaAntiKorupsiDetail | null, // folders[] + dokumenUmum
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/desaantikorupsi/${id}`);
        if (res.ok) {
          const data = await res.json();
          desaAntikorupsi.findUnique.data = data.data ?? null;
        } else {
          desaAntikorupsi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        desaAntikorupsi.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        desaAntikorupsi.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/desaantikorupsi/del/${id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Desa antikorupsi berhasil dihapus");
          await desaAntikorupsi.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus desa antikorupsi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus desa antikorupsi");
      } finally {
        desaAntikorupsi.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: defaultDesaAntikorupsi(),
    loading: false,

    async load(id: string): Promise<DesaAntiKorupsiDetail | null> {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(`/api/landingpage/desaantikorupsi/${id}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result?.success) {
          const data = result.data as DesaAntiKorupsiDetail;
          desaAntikorupsi.edit.id = data.id;
          desaAntikorupsi.edit.form = {
            name: data.name,
            deskripsi: data.deskripsi,
            kategoriId: data.kategoriId,
            ...isiFormFromDetail(data),
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading desa antikorupsi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateDesaAntikorupsi.safeParse(desaAntikorupsi.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        desaAntikorupsi.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/desaantikorupsi/${desaAntikorupsi.edit.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: desaAntikorupsi.edit.form.name,
              deskripsi: desaAntikorupsi.edit.form.deskripsi,
              kategoriId: desaAntikorupsi.edit.form.kategoriId,
              folders: desaAntikorupsi.edit.form.folders,
              dokumen: desaAntikorupsi.edit.form.dokumen,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update desa antikorupsi");
          await desaAntikorupsi.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update desa antikorupsi");
        }
      } catch (error) {
        console.error("Error updating desa antikorupsi:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal update desa antikorupsi"
        );
        return false;
      } finally {
        desaAntikorupsi.edit.loading = false;
      }
    },
    reset() {
      desaAntikorupsi.edit.id = "";
      desaAntikorupsi.edit.form = defaultDesaAntikorupsi();
    },
  },
});

export default desaAntikorupsi;
