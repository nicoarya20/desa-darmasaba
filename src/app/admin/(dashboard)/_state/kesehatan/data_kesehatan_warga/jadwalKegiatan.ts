/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

/* Informasi Kegiatan */
const templateForm = z.object({
  content: z.string().min(1, "Content minimal 1 karakter"),
  informasiJadwalKegiatan: z.object({
    name: z.string().min(1, "Name minimal 1 karakter"),
    tanggal: z.string().min(1, "Tanggal minimal 1 karakter"),
    waktu: z.string().min(1, "Waktu minimal 1 karakter"),
    lokasi: z.string().min(1, "Lokasi minimal 1 karakter"),
  }),
  deskripsiJadwalKegiatan: z.object({
    deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
  }),
  layananJadwalKegiatan: z.object({
    content: z.string().min(1, "Content minimal 1 karakter"),
  }),
  syaratKetentuanJadwalKegiatan: z.object({
    content: z.string().min(1, "Content minimal 1 karakter"),
  }),
  dokumenJadwalKegiatan: z.object({
    content: z.string().min(1, "Content minimal 1 karakter"),
  }),
  pendaftaranJadwalKegiatan: z.object({
    name: z.string().min(1, "Name minimal 1 karakter"),
    tanggal: z.string().min(1, "Tanggal minimal 1 karakter"),
    namaOrangtua: z.string().min(1, "Nama Orangtua minimal 1 karakter"),
    nomor: z.string().min(1, "Nomor minimal 1 karakter"),
    alamat: z.string().min(1, "Alamat minimal 1 karakter"),
    catatan: z.string().min(1, "Catatan minimal 1 karakter"),
  }),
});

const defaultForm = {
  content: "",
  informasiJadwalKegiatan: {
    name: "",
    tanggal: "",
    waktu: "",
    lokasi: "",
  },
  deskripsiJadwalKegiatan: {
    deskripsi: "",
  },
  layananJadwalKegiatan: {
    content: "",
  },
  syaratKetentuanJadwalKegiatan: {
    content: "",
  },
  dokumenJadwalKegiatan: {
    content: "",
  },
  pendaftaranJadwalKegiatan: {
    name: "",
    tanggal: "",
    namaOrangtua: "",
    nomor: "",
    alamat: "",
    catatan: "",
  },
};

const jadwalkegiatanState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async submit() {
      const cek = templateForm.safeParse(this.form);
      if (!cek.success) {
        const errMsg = cek.error.issues
          .map((v) => `${v.path.join(".")}: ${v.message}`)
          .join("\n");
        toast.error(errMsg);
        return null;
      }

      try {
        this.loading = true;
        const payload = { ...this.form };

        const res = await (ApiFetch.api.kesehatan as any)[
          "jadwal-kegiatan"
        ].create.post(payload);

        if (res.status === 200) {
          toast.success("Berhasil menambahkan jadwal kegiatan");
          this.resetForm();
          await jadwalkegiatanState.findMany.load();
          return res.data;
        }
      } catch (err: any) {
        const msg = err?.message || "Terjadi kesalahan saat mengirim data";
        toast.error(msg);
        console.error("SUBMIT ERROR:", err);
        return null;
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.form = { ...defaultForm };
    },
  },

  findMany: {
    data: null as
      | Prisma.JadwalKegiatanGetPayload<{
          include: {
            informasijadwalkegiatan: true;
            deskripsijadwalkegiatan: true;
            layananjadwalkegiatan: true;
            dokumenjadwalkegiatan: true;
            pendaftaranjadwalkegiatan: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      jadwalkegiatanState.findMany.loading = true; // ✅ Akses langsung via nama path
      jadwalkegiatanState.findMany.page = page;
      jadwalkegiatanState.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan["jadwal-kegiatan"][
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          jadwalkegiatanState.findMany.data = res.data.data ?? [];
          jadwalkegiatanState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          jadwalkegiatanState.findMany.data = [];
          jadwalkegiatanState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch jadwal kegiatan paginated:", err);
        jadwalkegiatanState.findMany.data = [];
        jadwalkegiatanState.findMany.totalPages = 1;
      } finally {
        jadwalkegiatanState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.JadwalKegiatanGetPayload<{
      include: {
        informasijadwalkegiatan: true;
        deskripsijadwalkegiatan: true;
        layananjadwalkegiatan: true;
        syaratketentuanjadwalkegiatan: true;
        dokumenjadwalkegiatan: true;
        pendaftaranjadwalkegiatan: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      const res = await fetch(`/api/kesehatan/jadwal-kegiatan/${id}`);
      if (res.ok) {
        const data = await res.json();
        jadwalkegiatanState.findUnique.data = data.data ?? null;
      } else {
        toast.error("Gagal load data jadwal kegiatan");
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      const res = await fetch(`/api/kesehatan/jadwal-kegiatan/${id}`);
      if (!res.ok) {
        toast.error("Gagal load data jadwal kegiatan");
        return;
      }

      const result = await res.json();
      const data = result.data;

      jadwalkegiatanState.edit.id = data.id;
      jadwalkegiatanState.edit.form = {
        content: data.content,
        informasiJadwalKegiatan: {
          name: data.informasijadwalkegiatan.name,
          tanggal: data.informasijadwalkegiatan.tanggal,
          waktu: data.informasijadwalkegiatan.waktu,
          lokasi: data.informasijadwalkegiatan.lokasi,
        },
        layananJadwalKegiatan: {
          content: data.layananjadwalkegiatan.content,
        },
        deskripsiJadwalKegiatan: {
          deskripsi: data.deskripsijadwalkegiatan.deskripsi,
        },
        syaratKetentuanJadwalKegiatan: {
          content: data.syaratketentuanjadwalkegiatan.content,
        },
        dokumenJadwalKegiatan: {
          content: data.dokumenjadwalkegiatan.content,
        },
        pendaftaranJadwalKegiatan: {
          name: data.pendaftaranjadwalkegiatan.name,
          tanggal: data.pendaftaranjadwalkegiatan.tanggal,
          namaOrangtua: data.pendaftaranjadwalkegiatan.namaOrangtua,
          nomor: data.pendaftaranjadwalkegiatan.nomor,
          alamat: data.pendaftaranjadwalkegiatan.alamat,
          catatan: data.pendaftaranjadwalkegiatan.catatan,
        },
      };
    },
    async submit() {
      const cek = templateForm.safeParse(jadwalkegiatanState.edit.form);
      if (!cek.success) {
        const errMsg = cek.error.issues
          .map((v) => `${v.path.join(".")}: ${v.message}`)
          .join("\n");
        toast.error(errMsg);
        return null;
      }

      try {
        jadwalkegiatanState.edit.loading = true;
        const payload = {
          content: jadwalkegiatanState.edit.form.content,
          informasiJadwalKegiatan: {
            name: jadwalkegiatanState.edit.form.informasiJadwalKegiatan.name,
            tanggal:
              jadwalkegiatanState.edit.form.informasiJadwalKegiatan.tanggal,
            waktu: jadwalkegiatanState.edit.form.informasiJadwalKegiatan.waktu,
            lokasi:
              jadwalkegiatanState.edit.form.informasiJadwalKegiatan.lokasi,
          },
          layananJadwalKegiatan: {
            content:
              jadwalkegiatanState.edit.form.layananJadwalKegiatan.content,
          },
          deskripsiJadwalKegiatan: {
            deskripsi:
              jadwalkegiatanState.edit.form.deskripsiJadwalKegiatan.deskripsi,
          },
          syaratKetentuanJadwalKegiatan: {
            content:
              jadwalkegiatanState.edit.form.syaratKetentuanJadwalKegiatan
                .content,
          },
          dokumenJadwalKegiatan: {
            content:
              jadwalkegiatanState.edit.form.dokumenJadwalKegiatan.content,
          },
          pendaftaranJadwalKegiatan: {
            name: jadwalkegiatanState.edit.form.pendaftaranJadwalKegiatan.name,
            tanggal:
              jadwalkegiatanState.edit.form.pendaftaranJadwalKegiatan.tanggal,
            namaOrangtua:
              jadwalkegiatanState.edit.form.pendaftaranJadwalKegiatan
                .namaOrangtua,
            nomor:
              jadwalkegiatanState.edit.form.pendaftaranJadwalKegiatan.nomor,
            alamat:
              jadwalkegiatanState.edit.form.pendaftaranJadwalKegiatan.alamat,
            catatan:
              jadwalkegiatanState.edit.form.pendaftaranJadwalKegiatan.catatan,
          },
        };

        const res = await fetch(
          `/api/kesehatan/jadwal-kegiatan/${jadwalkegiatanState.edit.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Update gagal");
        }

        toast.success("Berhasil update jadwal kegiatan");
        await jadwalkegiatanState.findMany.load();
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Terjadi kesalahan saat update"
        );
        return false;
      } finally {
        jadwalkegiatanState.edit.loading = false;
      }
    },
    resetForm() {
      jadwalkegiatanState.edit.id = "";
      jadwalkegiatanState.edit.form = { ...defaultForm };
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      try {
        jadwalkegiatanState.delete.loading = true;
        const res = await fetch(`/api/kesehatan/jadwal-kegiatan/del/${id}`, {
          method: "DELETE",
        });

        const result = await res.json();
        if (res.ok && result.success) {
          toast.success("Jadwal kegiatan berhasil dihapus");
          await jadwalkegiatanState.findMany.load();
        } else {
          toast.error(result.message || "Gagal menghapus");
        }
      } catch {
        toast.error("Terjadi kesalahan saat menghapus");
      } finally {
        jadwalkegiatanState.delete.loading = false;
      }
    },
  },
});

export default jadwalkegiatanState;
