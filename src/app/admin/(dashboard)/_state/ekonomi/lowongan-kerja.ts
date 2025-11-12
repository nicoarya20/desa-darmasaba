/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  posisi: z.string(),
  namaPerusahaan: z.string(),
  lokasi: z.string(),
  tipePekerjaan: z.string(),
  gaji: z.string(),
  deskripsi: z.string(),
  kualifikasi: z.string(),
  notelp: z.string(),
});

const defaultForm = {
  posisi: "",
  namaPerusahaan: "",
  lokasi: "",
  tipePekerjaan: "",
  gaji: "",
  deskripsi: "",
  kualifikasi: "",
  notelp: "",
};

const lowonganKerjaState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(lowonganKerjaState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        lowonganKerjaState.create.loading = true;
        const res = await ApiFetch.api.ekonomi.lowongankerja["create"].post(
          lowonganKerjaState.create.form
        );
        if (res.status === 200) {
          lowonganKerjaState.create.loading = false;
          return toast.success("Sukses menambahkan");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        lowonganKerjaState.create.loading = false;
      }
    },
    resetForm() {
      lowonganKerjaState.create.form = { ...defaultForm };
    },
  },
  findMany: {
    data: null as
      | Prisma.LowonganPekerjaanGetPayload<{
          omit: {
            isActive: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
   load: async (page = 1, limit = 10, search = "") => {
      lowonganKerjaState.findMany.loading = true; // ✅ Akses langsung via nama path
      lowonganKerjaState.findMany.page = page;
      lowonganKerjaState.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.ekonomi.lowongankerja["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          lowonganKerjaState.findMany.data = res.data.data ?? [];
          lowonganKerjaState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          lowonganKerjaState.findMany.data = [];
          lowonganKerjaState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch lowongan kerja paginated:", err);
        lowonganKerjaState.findMany.data = [];
        lowonganKerjaState.findMany.totalPages = 1;
      } finally {
        lowonganKerjaState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.LowonganPekerjaanGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ekonomi/lowongankerja/${id}`);
        if (res.ok) {
          const data = await res.json();
          lowonganKerjaState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          lowonganKerjaState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        lowonganKerjaState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        lowonganKerjaState.delete.loading = true;
        const response = await fetch(`/api/ekonomi/lowongankerja/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Lowongan kerja berhasil dihapus");
          await lowonganKerjaState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus lowongan kerja");
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        toast.error("Terjadi kesalahan saat menghapus lowongan kerja");
      } finally {
        lowonganKerjaState.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(`/api/ekonomi/lowongankerja/${id}`, {
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
            posisi: data.posisi,
            namaPerusahaan: data.namaPerusahaan,
            lokasi: data.lokasi,
            tipePekerjaan: data.tipePekerjaan,
            gaji: data.gaji,
            deskripsi: data.deskripsi,
            kualifikasi: data.kualifikasi,
            notelp: data.notelp,
          };
          return data;
        } else {
          throw new Error(
            result?.message || "Gagal memuat data lowongan kerja"
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateForm.safeParse(lowonganKerjaState.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        lowonganKerjaState.update.loading = true;
        const response = await fetch(`/api/ekonomi/lowongankerja/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            posisi: this.form.posisi,
            namaPerusahaan: this.form.namaPerusahaan,
            lokasi: this.form.lokasi,
            tipePekerjaan: this.form.tipePekerjaan,
            gaji: this.form.gaji,
            deskripsi: this.form.deskripsi,
            kualifikasi: this.form.kualifikasi,
            notelp: this.form.notelp,
          }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || `HTTP error! status: ${response.status}`
            );
        }
        const result = await response.json();
        if (result.success) {
            toast.success("Berhasil update lowongan kerja");
            await lowonganKerjaState.findMany.load(); // refresh list
            return true;
        } else {
            throw new Error(result.message || "Gagal update lowongan kerja");
        }
      } catch (error) {
        console.error("Error updating data:", error);
        toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat mengupdate lowongan kerja");
        return false;
      } finally {
        lowonganKerjaState.update.loading = false;
      }
    },
    reset() {
      lowonganKerjaState.update.id = "";
      lowonganKerjaState.update.form = { ...defaultForm };
    },
  },
});

export default lowonganKerjaState;
