/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePegawai = z.object({
  namaLengkap: z.string().min(1, "Nama wajib diisi"),
  gelarAkademik: z.string().min(1, "Gelar Akademik wajib diisi"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
  tanggalMasuk: z.string().min(1, "Tanggal masuk wajib diisi"),
  email: z.string().email("Email tidak valid").optional(),
  telepon: z.string().min(1, "Telepom wajib diisi"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  posisiId: z.string().min(1, "Posisi wajib diisi"),
  isActive: z.boolean().default(true),
});

const pegawaiDefaultForm = {
  namaLengkap: "",
  gelarAkademik: "",
  imageId: "",
  tanggalMasuk: "",
  email: "",
  telepon: "",
  alamat: "",
  posisiId: "",
  isActive: true,
};

const pegawai = proxy({
  create: {
    form: { ...pegawaiDefaultForm },
    loading: false,
    async submit() {
      const cek = templatePegawai.safeParse(pegawai.create.form);
      if (!cek.success) {
        const err = cek.error.issues.map((i) => i.message).join("\n");
        toast.error(err);
        return;
      }

      try {
        pegawai.create.loading = true;
        const res = await ApiFetch.api.ppid.strukturppid.pegawai["create"].post(
          pegawai.create.form
        );
        if (res.status === 200) {
          toast.success("Pegawai berhasil ditambahkan");
          await pegawai.findMany.load();
        } else {
          toast.error(res.data?.message ?? "Gagal tambah pegawai");
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error("Terjadi kesalahan saat menambahkan pegawai");
      } finally {
        pegawai.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as
      | Prisma.PegawaiPPIDGetPayload<{
          include: {
            image: true;
            posisi: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      pegawai.findMany.loading = true;
      pegawai.findMany.page = page;
      pegawai.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ppid.strukturppid.pegawai[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          pegawai.findMany.data = res.data.data || [];
          pegawai.findMany.total = res.data.total || 0;
          pegawai.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load pegawai:", res.data?.message);
          pegawai.findMany.data = [];
          pegawai.findMany.total = 0;
          pegawai.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading pegawai:", error);
        pegawai.findMany.data = [];
        pegawai.findMany.total = 0;
        pegawai.findMany.totalPages = 1;
      } finally {
        pegawai.findMany.loading = false;
      }
    },
  },
  findManyAll: {
    data: null as
      | Prisma.PegawaiPPIDGetPayload<{
          include: {
            image: true;
            posisi: true;
          };
        }>[]
      | null,
    loading: false,
    search: "",
    load: async (search = "") => {
      pegawai.findManyAll.loading = true;
      pegawai.findManyAll.search = search;
      try {
        const query: any = { search };
        if (search) query.search = search;

        const res = await ApiFetch.api.ppid.strukturppid.pegawai[
          "find-many-all"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          pegawai.findManyAll.data = res.data.data || [];
        } else {
          console.error("Failed to load pegawai:", res.data?.message);
          pegawai.findManyAll.data = [];
        }
      } catch (error) {
        console.error("Error loading pegawai:", error);
        pegawai.findManyAll.data = [];
      } finally {
        pegawai.findManyAll.loading = false;
      }
    },
  },
  findUnique: {
    data: null as
      | (Prisma.PegawaiPPIDGetPayload<{
          include: { posisi: true; image: true };
        }> & { isActive: boolean })
      | null,
    async load(id: string) {
      const res = await fetch(`/api/ppid/strukturppid/pegawai/${id}`);
      if (res.ok) {
        const json = await res.json();
        pegawai.findUnique.data = json.data
          ? {
              ...json.data,
              isActive: json.data.isActive ?? json.data.aktif ?? true,
            }
          : null;
      } else {
        pegawai.findUnique.data = null;
      }
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        pegawai.delete.loading = true;
        const res = await fetch(`/api/ppid/strukturppid/pegawai/del/${id}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (res.ok) {
          toast.success(json.message ?? "Berhasil hapus pegawai");
          await pegawai.findMany.load();
        } else {
          toast.error(json.message ?? "Gagal hapus pegawai");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus");
      } finally {
        pegawai.delete.loading = false;
      }
    },
  },

  nonActive: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        pegawai.nonActive.loading = true;
        const res = await fetch(
          `/api/ppid/strukturppid/pegawai/non-active/${id}`,
          {
            method: "DELETE",
          }
        );
        const json = await res.json();
        if (res.ok) {
          toast.success(json.message ?? "Pegawai berhasil dinonaktifkan");
          await pegawai.findMany.load();
        } else {
          toast.error(json.message ?? "Gagal menonaktifkan pegawai");
        }
      } catch (error) {
        console.error("Gagal nonActive:", error);
        toast.error("Terjadi kesalahan saat menonaktifkan pegawai");
      } finally {
        pegawai.nonActive.loading = false;
      }
    },
  },

  active: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        pegawai.active.loading = true;
        const res = await fetch(
          `/api/ppid/strukturppid/pegawai/active/${id}`,
          {
            method: "PATCH",
          }
        );
        const json = await res.json();
        if (res.ok) {
          toast.success(json.message ?? "Pegawai berhasil diaktifkan");
          await pegawai.findMany.load();
        } else {
          toast.error(json.message ?? "Gagal mengaktifkan pegawai");
        }
      } catch (error) {
        console.error("Gagal active:", error);
        toast.error("Terjadi kesalahan saat mengaktifkan pegawai");
      } finally {
        pegawai.active.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: { ...pegawaiDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/ppid/strukturppid/pegawai/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            namaLengkap: data.namaLengkap,
            gelarAkademik: data.gelarAkademik,
            imageId: data.imageId,
            tanggalMasuk: data.tanggalMasuk,
            email: data.email,
            telepon: data.telepon,
            alamat: data.alamat,
            posisiId: data.posisiId,
            isActive: data.isActive,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading pegawai:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async submit() {
      const cek = templatePegawai.safeParse(pegawai.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        pegawai.edit.loading = true;

        const formattedTanggalMasuk = this.form.tanggalMasuk
          ? new Date(this.form.tanggalMasuk).toISOString()
          : undefined;

        const response = await fetch(
          `/api/ppid/strukturppid/pegawai/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: this.id,
              namaLengkap: this.form.namaLengkap,
              gelarAkademik: this.form.gelarAkademik,
              imageId: this.form.imageId || null,
              tanggalMasuk: formattedTanggalMasuk,
              email: this.form.email,
              telepon: this.form.telepon,
              alamat: this.form.alamat,
              posisiId: this.form.posisiId,
              isActive: this.form.isActive,
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
          toast.success("Berhasil update pegawai");
          await pegawai.findMany.load();
          return true;
        } else {
          throw new Error(result.message || "Gagal update pegawai");
        }
      } catch (error) {
        console.error("Error updating pegawai:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update pegawai"
        );
        return false;
      } finally {
        pegawai.edit.loading = false;
      }
    },

    reset() {
      pegawai.edit.id = "";
      pegawai.edit.form = { ...pegawaiDefaultForm };
    },
  },
});

export default pegawai;
