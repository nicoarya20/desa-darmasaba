/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  judul: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  imageId: z.string().nonempty(),
});

const defaultForm = {
  judul: "",
  deskripsi: "",
  imageId: "",
};

const tipsKeamananState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(tipsKeamananState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        tipsKeamananState.create.loading = true;
        const res = await ApiFetch.api.keamanan.menutipskeamanan["create"].post(
          tipsKeamananState.create.form
        );
        if (res.status === 200) {
          tipsKeamananState.findMany.load();
          return toast.success("Sukses menambahkan");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        tipsKeamananState.create.loading = false;
      }
    },
    resetForm() {
      tipsKeamananState.create.form = { ...defaultForm };
    },
  },
  findMany: {
    data: null as
      | Prisma.MenuTipsKeamananGetPayload<{
          include: {
            image: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
   load: async (page = 1, limit = 10, search = "") => {
      tipsKeamananState.findMany.loading = true; // ✅ Akses langsung via nama path
      tipsKeamananState.findMany.page = page;
      tipsKeamananState.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.keamanan.menutipskeamanan["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          tipsKeamananState.findMany.data = res.data.data ?? [];
          tipsKeamananState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          tipsKeamananState.findMany.data = [];
          tipsKeamananState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch menu tips keamanan paginated:", err);
        tipsKeamananState.findMany.data = [];
        tipsKeamananState.findMany.totalPages = 1;
      } finally {
        tipsKeamananState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.MenuTipsKeamananGetPayload<{
      include: { image: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/keamanan/menutipskeamanan/${id}`);
        if (res.ok) {
          const data = await res.json();
          tipsKeamananState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          tipsKeamananState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        tipsKeamananState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        tipsKeamananState.delete.loading = true;

        // Pakai Eden (ApiFetch) — konsisten dgn pola delete yang bekerja
        // (inovasi/program-kreatif). Eden tak set Content-Type json untuk
        // DELETE tanpa body, jadi tak memicu 400 parse-body kosong di Elysia.
        const res = await (ApiFetch.api.keamanan.menutipskeamanan as any)["del"][id].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Tips keamanan berhasil dihapus");
          await tipsKeamananState.findMany.load(); // refresh list
        } else {
          toast.error(res.data?.message || "Gagal menghapus tips keamanan");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan saat menghapus tips keamanan");
        console.error("Gagal delete:", error);
      } finally {
        tipsKeamananState.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    loading: false,
    form: { ...defaultForm },

    async load(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        tipsKeamananState.update.loading = true;
        const response = await fetch(`/api/keamanan/menutipskeamanan/${id}`, {
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
            imageId: data.imageId || "",
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data");
        return null;
      }
    },
    async update() {
      const cek = templateForm.safeParse(tipsKeamananState.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        tipsKeamananState.update.loading = true;
        const response = await fetch(
          `/api/keamanan/menutipskeamanan/${tipsKeamananState.update.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              judul: this.form.judul,
              deskripsi: this.form.deskripsi,
              imageId: this.form.imageId,
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
          toast.success("Berhasil update tips keamanan");
          await tipsKeamananState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update tips keamanan");
        }
      } catch (error) {
        console.error("Error updating data:", error);
        toast.error("Gagal update data");
        return false;
      } finally {
        tipsKeamananState.update.loading = false;
      }
    },
    reset() {
      tipsKeamananState.update.id = "";
      tipsKeamananState.update.form = { ...defaultForm };
    },
  },
});
export default tipsKeamananState;
