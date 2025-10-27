/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateDaftarInformasi = z.object({
  jenisInformasi: z.string().min(3, "Jenis Informasi minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  tanggal: z.string().min(3, "Tanggal minimal 3 karakter"),
});

const defaultForm = {
  jenisInformasi: "",
  deskripsi: "",
  tanggal: "",
};

const daftarInformasiPublik = proxy({
  create: {
    form: {...defaultForm},
    loading: false,
    async create() {
      const cek = templateDaftarInformasi.safeParse(
        daftarInformasiPublik.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        daftarInformasiPublik.create.loading = true;
        const res = await ApiFetch.api.ppid.daftarinformasipublik[
          "create"
        ].post(daftarInformasiPublik.create.form);
        if (res.status === 200) {
          daftarInformasiPublik.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        daftarInformasiPublik.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.DaftarInformasiPublikGetPayload<{
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
      daftarInformasiPublik.findMany.loading = true; // ✅ Akses langsung via nama path
      daftarInformasiPublik.findMany.page = page;
      daftarInformasiPublik.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.ppid.daftarinformasipublik["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          daftarInformasiPublik.findMany.data = res.data.data ?? [];
          daftarInformasiPublik.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          daftarInformasiPublik.findMany.data = [];
          daftarInformasiPublik.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch daftar informasi publik paginated:", err);
        daftarInformasiPublik.findMany.data = [];
        daftarInformasiPublik.findMany.totalPages = 1;
      } finally {
        daftarInformasiPublik.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.DaftarInformasiPublikGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ppid/daftarinformasipublik/${id}`);
        if (res.ok) {
          const data = await res.json();
          daftarInformasiPublik.findUnique.data = data.data ?? null;
        } else {
          console.error(
            "Failed to fetch daftar informasi publik:",
            res.statusText
          );
          daftarInformasiPublik.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching daftar informasi publik:", error);
        daftarInformasiPublik.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        daftarInformasiPublik.delete.loading = true;

        const response = await fetch(
          `/api/ppid/daftarinformasipublik/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(
            result.message || "Daftar Informasi Publik berhasil dihapus"
          );
          await daftarInformasiPublik.findMany.load(); // refresh list
        } else {
          toast.error(
            result?.message || "Gagal menghapus daftar informasi publik"
          );
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus daftar informasi publik");
      } finally {
        daftarInformasiPublik.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/ppid/daftarinformasipublik/${id}`, {
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
            jenisInformasi: data.jenisInformasi,
            deskripsi: data.deskripsi,
            tanggal: data.tanggal,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal mengambil data");
        }
      } catch (error) {
        console.error("Error loading daftar informasi publik:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateDaftarInformasi.safeParse(
        daftarInformasiPublik.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        daftarInformasiPublik.edit.loading = true;
        const formattedTanggal = this.form.tanggal
        ? new Date(this.form.tanggal).toISOString()
        : undefined;
        const response = await fetch(
          `/api/ppid/daftarinformasipublik/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jenisInformasi: this.form.jenisInformasi,
              deskripsi: this.form.deskripsi,
              tanggal: formattedTanggal,
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
          toast.success("Berhasil update daftar informasi publik");
          await daftarInformasiPublik.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal update daftar informasi publik"
          );
        }
      } catch (error) {
        console.error("Error updating daftar informasi publik:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update daftar informasi publik"
        );
        return false;
      } finally {
        daftarInformasiPublik.edit.loading = false;
      }
    },

    reset() {
      daftarInformasiPublik.edit.id = "";
      daftarInformasiPublik.edit.form = { ...defaultForm };
    },
  },
});

export default daftarInformasiPublik;
