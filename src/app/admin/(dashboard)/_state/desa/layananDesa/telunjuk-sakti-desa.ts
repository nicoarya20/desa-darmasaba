/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const telunjukSaktiDesaForm = {
  name: "",
  deskripsi: "",
  link: "",
};

const templateTelunjukSaktiDesaForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

const pelayananTelunjukSaktiDesa = proxy({
  create: {
    form: { ...telunjukSaktiDesaForm },
    loading: false,
    async create() {
      const cek = templateTelunjukSaktiDesaForm.safeParse(
        pelayananTelunjukSaktiDesa.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pelayananTelunjukSaktiDesa.create.loading = true;
        const res = await ApiFetch.api.desa.layanan.pelayanantelunjuksaktidesa[
          "create"
        ].post(pelayananTelunjukSaktiDesa.create.form);
        if (res.status === 200) {
          pelayananTelunjukSaktiDesa.findMany.load();
          return toast.success("Telunjuk Sakti Desa berhasil disimpan!");
        }
        return toast.error("Gagal menyimpan telunjuk sakti desa");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        pelayananTelunjukSaktiDesa.create.loading = false;
      }
    },
    resetForm() {
      pelayananTelunjukSaktiDesa.create.form = { ...telunjukSaktiDesaForm };
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
      pelayananTelunjukSaktiDesa.findMany.loading = true;
      pelayananTelunjukSaktiDesa.findMany.page = page;
      pelayananTelunjukSaktiDesa.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.desa.layanan.pelayanantelunjuksaktidesa[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          pelayananTelunjukSaktiDesa.findMany.data = res.data.data || [];
          pelayananTelunjukSaktiDesa.findMany.total = res.data.total || 0;
          pelayananTelunjukSaktiDesa.findMany.totalPages =
            res.data.totalPages || 1;
        } else {
          console.error("Failed to load telunjuk sakti desa:", res.data?.message);
          pelayananTelunjukSaktiDesa.findMany.data = [];
          pelayananTelunjukSaktiDesa.findMany.total = 0;
          pelayananTelunjukSaktiDesa.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading telunjuk sakti desa:", error);
        pelayananTelunjukSaktiDesa.findMany.data = [];
        pelayananTelunjukSaktiDesa.findMany.total = 0;
        pelayananTelunjukSaktiDesa.findMany.totalPages = 1;
      } finally {
        pelayananTelunjukSaktiDesa.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PelayananTelunjukSaktiDesaGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/desa/layanan/pelayanantelunjuksaktidesa/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          pelayananTelunjukSaktiDesa.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch telunjuk sakti desa:", res.statusText);
          pelayananTelunjukSaktiDesa.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching telunjuk sakti desa:", error);
        pelayananTelunjukSaktiDesa.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        pelayananTelunjukSaktiDesa.delete.loading = true;
        const response = await fetch(
          `/api/desa/layanan/pelayanantelunjuksaktidesa/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          toast.success(
            result.message || "Telunjuk Sakti Desa berhasil dihapus"
          );
          await pelayananTelunjukSaktiDesa.findMany.load();
        } else {
          toast.error(result.message || "Gagal menghapus telunjuk sakti desa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus telunjuk sakti desa");
      } finally {
        pelayananTelunjukSaktiDesa.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...telunjukSaktiDesaForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/desa/layanan/pelayanantelunjuksaktidesa/${id}`,
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
            link: data.link,
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching telunjuk sakti desa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateTelunjukSaktiDesaForm.safeParse(
        pelayananTelunjukSaktiDesa.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pelayananTelunjukSaktiDesa.edit.loading = true;
        const response = await fetch(
          `/api/desa/layanan/pelayanantelunjuksaktidesa/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              deskripsi: this.form.deskripsi,
              link: this.form.link,
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
          toast.success(
            result.message || "Telunjuk Sakti Desa berhasil diupdate"
          );
          await pelayananTelunjukSaktiDesa.findMany.load();
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate telunjuk sakti desa"
          );
        }
      } catch (error) {
        console.error("Error updating telunjuk sakti desa:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update telunjuk sakti desa"
        );
        return false;
      } finally {
        pelayananTelunjukSaktiDesa.edit.loading = false;
      }
    },
  },
});

export default pelayananTelunjukSaktiDesa;
