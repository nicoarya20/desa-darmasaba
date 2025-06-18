/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateFormPengumuman = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
  categoryPengumumanId: z.string().nonempty(),
});

const category = proxy({
  findMany: {
    data: null as
      | null
      | Prisma.CategoryPengumumanGetPayload<{ omit: { isActive: true } }>[],
    async load() {
      const res = await ApiFetch.api.desa.pengumuman.category[
        "find-many"
      ].get();
      if (res.status === 200) {
        category.findMany.data = (res.data?.data as any) ?? [];
      }
    },
  },
});

type PengumumanForm = Prisma.PengumumanGetPayload<{
  select: {
    judul: true;
    deskripsi: true;
    content: true;
    categoryPengumumanId: true;
  };
}>;
const pengumuman = proxy({
  create: {
    form: {} as PengumumanForm,
    loading: false,
    async create() {
      const cek = templateFormPengumuman.safeParse(pengumuman.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pengumuman.create.loading = true;
        const res = await ApiFetch.api.desa.pengumuman["create"].post(
          pengumuman.create.form
        );
        if (res.status === 200) {
          pengumuman.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        pengumuman.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.PengumumanGetPayload<{ 
        include: {
            CategoryPengumuman: true;
        }
       }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.desa.pengumuman["find-many"].get();
      console.log(res);
      if (res.status === 200) {
        pengumuman.findMany.data = res.data?.data ?? [];
      }
    },
  },
  // findUnique: {
  //   data: null as
  //   | Prisma.PengumumanGetPayload<{
  //       include: {
  //           CategoryPengumuman: true;
  //       }
  //   }>
  //   | null,
  //   async load(id: string) {
  //     try {
  //       const res = await fetch(`/api/desa/pengumuman/${id}`);
  //       if (res.ok) {
  //         const data = await res.json();
  //         pengumuman.findUnique.data = data.data ?? null;
  //       } else {
  //         console.error('Failed to fetch pengumuman:', res.statusText);
  //         pengumuman.findUnique.data = null;
  //       }
  //     } catch (error) {
  //       console.error('Error fetching pengumuman:', error);
  //       pengumuman.findUnique.data = null;
  //     }
  //   },
  // },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pengumuman.delete.loading = true;

        const response = await fetch(`/api/desa/pengumuman/delete/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Pengumuman berhasil dihapus");
          await pengumuman.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus pengumuman");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pengumuman");
      } finally {
        pengumuman.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: {} as PengumumanForm,
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/desa/pengumuman/${id}`, {
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
            judul: data.judul,
            deskripsi: data.deskripsi,
            content: data.content,
            categoryPengumumanId: data.categoryPengumumanId || "",
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal mengambil data pengumuman");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data pengumuman");
      } finally {
        pengumuman.update.loading = false;
      }
    },

    async update() {
      const cek = templateFormPengumuman.safeParse(pengumuman.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        pengumuman.update.loading = true;

        const response = await fetch(`/api/desa/pengumuman/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul: this.form.judul,
            deskripsi: this.form.deskripsi,
            content: this.form.content,
            categoryPengumumanId: this.form.categoryPengumumanId,
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
          toast.success("Berhasil update pengumuman");
          await pengumuman.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update pengumuman");
        }
      } catch (error) {
        console.error("Error updating pengumuman:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update pengumuman"
        );
        return false;
      } finally {
        pengumuman.update.loading = false;
      }
    },
  },
});

const stateDesaPengumuman = proxy({
  category,
  pengumuman,
});
export default stateDesaPengumuman;
