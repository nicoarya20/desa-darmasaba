/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateDesaAntiKorupsiForm = z.object({
  name: z.string().min(1, "Judul minimal 1 karakter"),
  deskripsi: z.string().min(1, "Deskripsi minimal 1 karakter"),
  kategoriId: z.string().min(1, "Kategori minimal 1"),
  fileId: z.string().min(1, "File minimal 1"),
});

const defaultDesaAntiKorupsiForm = {
  name: "",
  deskripsi: "",
  kategoriId: "",
  fileId: "",
};

const desaAntikorupsi = proxy({
  create: {
    form: { ...defaultDesaAntiKorupsiForm },
    loading: false,
    async create() {
      const cek = templateDesaAntiKorupsiForm.safeParse(
        desaAntikorupsi.create.form
      );
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
        ].post({
          ...desaAntikorupsi.create.form,
        });

        if (res.status === 200) {
          desaAntikorupsi.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        // Pesan server (mis. 409 "Nama sudah dipakai")
        return toast.error(getServerMessage(res) || "Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        desaAntikorupsi.create.loading = false;
      }
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
      // Change to arrow function
      desaAntikorupsi.findMany.loading = true; // Use the full path to access the property
      desaAntikorupsi.findMany.page = page;
      desaAntikorupsi.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.landingpage.desaantikorupsi[
          "findMany"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          desaAntikorupsi.findMany.data = res.data.data || [];
          desaAntikorupsi.findMany.total = res.data.total || 0;
          desaAntikorupsi.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load media sosial:", res.data?.message);
          desaAntikorupsi.findMany.data = [];
          desaAntikorupsi.findMany.total = 0;
          desaAntikorupsi.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading media sosial:", error);
        desaAntikorupsi.findMany.data = [];
        desaAntikorupsi.findMany.total = 0;
        desaAntikorupsi.findMany.totalPages = 1;
      } finally {
        desaAntikorupsi.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.DesaAntiKorupsiGetPayload<{
      include: {
        file: true;
        kategori: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/desaantikorupsi/${id}`);
        if (res.ok) {
          const data = await res.json();
          desaAntikorupsi.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
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
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "desa anti korupsi berhasil dihapus");
          await desaAntikorupsi.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus desa anti korupsi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus desa anti korupsi");
      } finally {
        desaAntikorupsi.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultDesaAntiKorupsiForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        desaAntikorupsi.edit.loading = true;

        const response = await fetch(`/api/landingpage/desaantikorupsi/${id}`, {
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
            name: data.name,
            deskripsi: data.deskripsi,
            kategoriId: data.kategoriId,
            fileId: data.fileId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading desa anti korupsi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        desaAntikorupsi.edit.loading = false;
      }
    },

    async update() {
      const cek = templateDesaAntiKorupsiForm.safeParse(
        desaAntikorupsi.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        desaAntikorupsi.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/desaantikorupsi/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              deskripsi: this.form.deskripsi,
              kategoriId: this.form.kategoriId,
              fileId: this.form.fileId,
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
          toast.success("Berhasil update desa anti korupsi");
          await desaAntikorupsi.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate desa anti korupsi"
          );
        }
      } catch (error) {
        console.error("Error updating desa anti korupsi:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate desa anti korupsi"
        );
        return false;
      } finally {
        desaAntikorupsi.edit.loading = false;
      }
    },
    reset() {
      desaAntikorupsi.edit.id = "";
      desaAntikorupsi.edit.form = { ...defaultDesaAntiKorupsiForm };
    },
  },
});

// ========================================= KATEGORI desa anti korupsi ========================================= //
const kategoriDesaAntiKorupsiForm = z.object({
  name: z.string().min(1, "Nama minimal 1 karakter"),
});

const kategoriDesaAntiKorupsiDefaultForm = {
  name: "",
};

const kategoriDesaAntiKorupsi = proxy({
  create: {
    form: { ...kategoriDesaAntiKorupsiDefaultForm },
    loading: false,
    async create() {
      const cek = kategoriDesaAntiKorupsiForm.safeParse(
        kategoriDesaAntiKorupsi.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        kategoriDesaAntiKorupsi.create.loading = true;
        const res = await ApiFetch.api.landingpage.kategoridak["create"].post(
          kategoriDesaAntiKorupsi.create.form
        );
        if (res.status === 200) {
          kategoriDesaAntiKorupsi.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        // Pesan server (mis. 409 "Nama sudah dipakai")
        return toast.error(getServerMessage(res) || "Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        kategoriDesaAntiKorupsi.create.loading = false;
      }
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
      // Change to arrow function
      kategoriDesaAntiKorupsi.findMany.loading = true; // Use the full path to access the property
      kategoriDesaAntiKorupsi.findMany.page = page;
      kategoriDesaAntiKorupsi.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.landingpage.kategoridak["findMany"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          kategoriDesaAntiKorupsi.findMany.data = res.data.data || [];
          kategoriDesaAntiKorupsi.findMany.total = res.data.total || 0;
          kategoriDesaAntiKorupsi.findMany.totalPages =
            res.data.totalPages || 1;
        } else {
          console.error("Failed to load media sosial:", res.data?.message);
          kategoriDesaAntiKorupsi.findMany.data = [];
          kategoriDesaAntiKorupsi.findMany.total = 0;
          kategoriDesaAntiKorupsi.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading media sosial:", error);
        kategoriDesaAntiKorupsi.findMany.data = [];
        kategoriDesaAntiKorupsi.findMany.total = 0;
        kategoriDesaAntiKorupsi.findMany.totalPages = 1;
      } finally {
        kategoriDesaAntiKorupsi.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriDesaAntiKorupsiGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/kategoridak/${id}`);
        if (res.ok) {
          const data = await res.json();
          kategoriDesaAntiKorupsi.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kategoriDesaAntiKorupsi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriDesaAntiKorupsi.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriDesaAntiKorupsi.delete.loading = true;

        // Pakai Eden (ApiFetch) — Eden tak set Content-Type json untuk DELETE
        // tanpa body (hindari 400 parse Elysia) & content-type aware saat parse
        // respons (hindari SyntaxError bila body non-JSON).
        const res = await (ApiFetch.api.landingpage as any).kategoridak["del"][
          id
        ].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "Kategori desa anti korupsi berhasil dihapus"
          );
          await kategoriDesaAntiKorupsi.findMany.load(); // refresh list
        } else {
          // Eden menaruh body respons non-2xx (mis. 400 FK-block) di
          // res.error.value, bukan res.data — baca keduanya agar pesan spesifik
          // backend tetap tampil.
          const msg = res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus kategori desa anti korupsi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error(
          "Terjadi kesalahan saat menghapus kategori desa anti korupsi"
        );
      } finally {
        kategoriDesaAntiKorupsi.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...kategoriDesaAntiKorupsiDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/landingpage/kategoridak/${id}`, {
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
            name: data.name,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori desa anti korupsi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = kategoriDesaAntiKorupsiForm.safeParse(
        kategoriDesaAntiKorupsi.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kategoriDesaAntiKorupsi.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/kategoridak/${kategoriDesaAntiKorupsi.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: kategoriDesaAntiKorupsi.edit.form.name,
            }),
          }
        );

        // Clone the response to avoid 'body already read' error
        const responseClone = response.clone();

        try {
          const result = await response.json();

          if (!response.ok) {
            console.error(
              "Update failed with status:",
              response.status,
              "Response:",
              result
            );
            throw new Error(
              result?.message ||
                `Gagal mengupdate kategori desa anti korupsi (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message ||
                "Berhasil memperbarui kategori desa anti korupsi"
            );
            await kategoriDesaAntiKorupsi.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate kategori desa anti korupsi"
            );
          }
        } catch (error) {
          // If JSON parsing fails, try to get the response text for better error messages
          try {
            const text = await responseClone.text();
            console.error("Error response text:", text);
            throw new Error(`Gagal memproses respons dari server: ${text}`);
          } catch (textError) {
            console.error("Error parsing response as text:", textError);
            console.error("Original error:", error);
            throw new Error("Gagal memproses respons dari server");
          }
        }
      } catch (error) {
        console.error("Error updating kategori desa anti korupsi:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate kategori desa anti korupsi"
        );
        return false;
      } finally {
        kategoriDesaAntiKorupsi.edit.loading = false;
      }
    },
    reset() {
      kategoriDesaAntiKorupsi.edit.id = "";
      kategoriDesaAntiKorupsi.edit.form = {
        ...kategoriDesaAntiKorupsiDefaultForm,
      };
    },
  },
});

const korupsiState = proxy({
  desaAntikorupsi,
  kategoriDesaAntiKorupsi,
});
export default korupsiState;
