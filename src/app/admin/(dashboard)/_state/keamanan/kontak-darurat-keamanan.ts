/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  icon: z.string().nonempty(),
  kategoriId: z.array(z.string()).min(1, "Minimal pilih satu kategori"),
});

const defaultForm = {
  nama: "",
  icon: "",
  kategoriId: [] as string[],
};

const kontakDaruratKeamananState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(
        kontakDaruratKeamananState.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        kontakDaruratKeamananState.create.loading = true;
        const res = await ApiFetch.api.keamanan.kontakdaruratkeamanan[
          "create"
        ].post(kontakDaruratKeamananState.create.form);
        if (res.status === 200) {
          kontakDaruratKeamananState.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        kontakDaruratKeamananState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.KontakDaruratKeamananGetPayload<{
        include: {
          kategori: true;
          kontakItems: {
            include: {
              kontakItem: true;
            };
          };
        };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kontakDaruratKeamananState.findMany.loading = true; // ✅ Akses langsung via nama path
      kontakDaruratKeamananState.findMany.page = page;
      kontakDaruratKeamananState.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.keamanan.kontakdaruratkeamanan[
          "findMany"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          kontakDaruratKeamananState.findMany.data = res.data.data ?? [];
          kontakDaruratKeamananState.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          kontakDaruratKeamananState.findMany.data = [];
          kontakDaruratKeamananState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kontak darurat paginated:", err);
        kontakDaruratKeamananState.findMany.data = [];
        kontakDaruratKeamananState.findMany.totalPages = 1;
      } finally {
        kontakDaruratKeamananState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KontakDaruratKeamananGetPayload<{
      include: {
        kontakItems: {
          include: {
            kontakItem: true;
          };
        };
        kategori: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/keamanan/kontakdaruratkeamanan/${id}`);
        if (res.ok) {
          const data = await res.json();
          kontakDaruratKeamananState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kontakDaruratKeamananState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kontakDaruratKeamananState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        kontakDaruratKeamananState.delete.loading = true;
        const response = await fetch(
          `/api/keamanan/kontakdaruratkeamanan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Kontak darurat berhasil dihapus");
          await kontakDaruratKeamananState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus kontak darurat");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kontak darurat");
      } finally {
        kontakDaruratKeamananState.delete.loading = false;
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
        const response = await fetch(
          `/api/keamanan/kontakdaruratkeamanan/${id}`,
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
            nama: data.nama,
            icon: data.icon || "",
            kategoriId:
              data.kontakItems?.map((item: any) => item.kontakItemId) || [],
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kontak darurat:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(
        kontakDaruratKeamananState.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kontakDaruratKeamananState.update.loading = true;
        const response = await fetch(
          `/api/keamanan/kontakdaruratkeamanan/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: this.form.nama,
              icon: this.form.icon,
              kategoriId: this.form.kategoriId,
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
          toast.success("Berhasil update kontak darurat");
          await kontakDaruratKeamananState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate kontak darurat");
        }
      } catch (error) {
        console.error("Error updating kontak darurat:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate kontak darurat"
        );
        return false;
      } finally {
        kontakDaruratKeamananState.update.loading = false;
      }
    },
    reset() {
      kontakDaruratKeamananState.update.id = "";
      kontakDaruratKeamananState.update.form = { ...defaultForm };
    },
  },
});

const templateFormItem = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  nomorTelepon: z.string().min(1, "Nomor Telepon minimal 1 karakter"),
  icon: z.string().nonempty(),
});

const defaultFormItem = {
  nama: "",
  nomorTelepon: "",
  icon: "",
};

const kontakDaruratItem = proxy({
  create: {
    form: { ...defaultFormItem },
    loading: false,
    async create() {
      const cek = templateFormItem.safeParse(kontakDaruratItem.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        kontakDaruratItem.create.loading = true;
        const res = await ApiFetch.api.keamanan.kontakitem["create"].post(
          kontakDaruratItem.create.form
        );
        if (res.status === 200) {
          kontakDaruratItem.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        kontakDaruratItem.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.KontakItemGetPayload<{
        omit: {
          isActive: true;
        };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      kontakDaruratItem.findMany.loading = true; // ✅ Akses langsung via nama path
      kontakDaruratItem.findMany.page = page;
      kontakDaruratItem.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.keamanan.kontakitem["find-many"].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          kontakDaruratItem.findMany.data = res.data.data ?? [];
          kontakDaruratItem.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          kontakDaruratItem.findMany.data = [];
          kontakDaruratItem.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch kontak darurat paginated:", err);
        kontakDaruratItem.findMany.data = [];
        kontakDaruratItem.findMany.totalPages = 1;
      } finally {
        kontakDaruratItem.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.KontakItemGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/keamanan/kontakitem/${id}`);
        if (res.ok) {
          const data = await res.json();
          kontakDaruratItem.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kontakDaruratItem.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kontakDaruratItem.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        kontakDaruratItem.delete.loading = true;
        const response = await fetch(`/api/keamanan/kontakitem/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Kontak item berhasil dihapus");
          await kontakDaruratItem.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus kontak item");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kontak item");
      } finally {
        kontakDaruratItem.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormItem },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/keamanan/kontakitem/${id}`, {
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
            nama: data.nama,
            nomorTelepon: data.nomorTelepon,
            icon: data.icon,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kontak darurat:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateFormItem.safeParse(kontakDaruratItem.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kontakDaruratItem.update.loading = true;
        const response = await fetch(`/api/keamanan/kontakitem/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: this.form.nama,
            nomorTelepon: this.form.nomorTelepon,
            icon: this.form.icon,
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
          toast.success("Berhasil update kontak item");
          await kontakDaruratItem.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate kontak item");
        }
      } catch (error) {
        console.error("Error updating kontak item:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate kontak item"
        );
        return false;
      } finally {
        kontakDaruratItem.update.loading = false;
      }
    },
    reset() {
      kontakDaruratItem.update.id = "";
      kontakDaruratItem.update.form = { ...defaultFormItem };
    },
  },
});

const kontakDarurat = proxy({
  kontakDaruratKeamananState,
  kontakDaruratItem,
});

export default kontakDarurat;
