/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateSuratKeteranganForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  imageId: z.string().nonempty(),
  image2Id: z.string().nonempty(),
});

const suratKeteranganForm = {
  name: "",
  deskripsi: "",
  imageId: "",
  image2Id: "",
};

const suratKeterangan = proxy({
  create: {
    form: { ...suratKeteranganForm },
    loading: false,
    async create() {
      const cek = templateSuratKeteranganForm.safeParse(
        suratKeterangan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        suratKeterangan.create.loading = true;
        const res = await ApiFetch.api.desa.layanan.pelayanansuratketerangan[
          "create"
        ].post(suratKeterangan.create.form);
        if (res.status === 200) {
          suratKeterangan.findMany.load();
          return toast.success("Surat Keterangan berhasil disimpan!");
        }
        return toast.error("Gagal menyimpan surat keterangan");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        suratKeterangan.create.loading = false;
      }
    },
    resetForm() {
      suratKeterangan.create.form = { ...suratKeteranganForm };
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      suratKeterangan.findMany.loading = true;
      suratKeterangan.findMany.page = page;
      suratKeterangan.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.desa.layanan.pelayanansuratketerangan[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          suratKeterangan.findMany.data = res.data.data || [];
          suratKeterangan.findMany.total = res.data.total || 0;
          suratKeterangan.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load surat keterangan:", res.data?.message);
          suratKeterangan.findMany.data = [];
          suratKeterangan.findMany.total = 0;
          suratKeterangan.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading surat keterangan:", error);
        suratKeterangan.findMany.data = [];
        suratKeterangan.findMany.total = 0;
        suratKeterangan.findMany.totalPages = 1;
      } finally {
        suratKeterangan.findMany.loading = false;
      }
    },
  },
  findManyAll: {
    data: null as Prisma.PelayananSuratKeteranganGetPayload<{
      omit: { isActive: true };
    }>[] | null,
    loading: false,
    load: async () => {
      suratKeterangan.findManyAll.loading = true;
      try {
        const res = await ApiFetch.api.desa.layanan.pelayanansuratketerangan["findManyAll"].get();

        if (res.status === 200 && res.data?.success) {
          suratKeterangan.findManyAll.data = res.data.data || [];
        } else {
          suratKeterangan.findManyAll.data = [];
          console.error("Failed to load surat keterangan all:", res.data?.message);
        }
      } catch (error) {
        console.error("Error loading surat keterangan all:", error);
        suratKeterangan.findManyAll.data = [];
      } finally {
        suratKeterangan.findManyAll.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PelayananSuratKeteranganGetPayload<{
      include: {
        image: true;
        image2: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/desa/layanan/pelayanansuratketerangan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          suratKeterangan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch surat keterangan:", res.statusText);
          suratKeterangan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching surat keterangan:", error);
        suratKeterangan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        suratKeterangan.delete.loading = true;
        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body, jadi tak memicu 400 parse-body kosong di Elysia (STG).
        const res = await (
          ApiFetch.api.desa.layanan.pelayanansuratketerangan as any
        )["del"][id].delete();
        // Handler del ini return { status, body } (bukan { success }),
        // jadi sukses dideteksi dari absennya res.error (HTTP 2xx).
        if (!res.error) {
          toast.success("Surat Keterangan berhasil dihapus");
          await suratKeterangan.findMany.load();
        } else {
          toast.error("Gagal menghapus surat keterangan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus surat keterangan");
      } finally {
        suratKeterangan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...suratKeteranganForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/desa/layanan/pelayanansuratketerangan/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            name: data.name,
            deskripsi: data.deskripsi,
            imageId: data.imageId || "",
            image2Id: data.image2Id || "",
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching surat keterangan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateSuratKeteranganForm.safeParse(
        suratKeterangan.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        suratKeterangan.edit.loading = true;
        const response = await fetch(
          `/api/desa/layanan/pelayanansuratketerangan/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              deskripsi: this.form.deskripsi,
              imageId: this.form.imageId,
              image2Id: this.form.image2Id,
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
          toast.success(result.message || "Surat Keterangan berhasil diupdate");
          await suratKeterangan.findMany.load();
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate surat keterangan"
          );
        }
      } catch (error) {
        console.error("Error updating surat keterangan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update surat keterangan"
        );
        return false;
      } finally {
        suratKeterangan.edit.loading = false;
      }
    },
  },
});

export default suratKeterangan;
