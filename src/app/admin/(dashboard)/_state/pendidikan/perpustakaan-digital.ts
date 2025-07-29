import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateDataPerpustakaan = z.object({
  judul: z.string().min(1, "Judul harus diisi"),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  imageId: z.string().min(1, "Image ID harus diisi"),
  kategoriId: z.string().min(1, "Kategori ID harus diisi"),
});

const defaultDataPerpustakaan = {
  judul: "",
  deskripsi: "",
  imageId: "",
  kategoriId: "",
};

const dataPerpustakaan = proxy({
  create: {
    form: { ...defaultDataPerpustakaan },
    loading: false,
    async create() {
      const cek = templateDataPerpustakaan.safeParse(
        dataPerpustakaan.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        dataPerpustakaan.create.loading = true;
        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.dataperpustakaan[
            "create"
          ].post(dataPerpustakaan.create.form);
        if (res.status === 200) {
          dataPerpustakaan.findMany.load();
          return toast.success("Data Data Perpustakaan Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        dataPerpustakaan.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.DataPerpustakaanGetPayload<{
      include: {
        kategori: true;
        image: true;
      };
    }>[],
    loading: false,
    async load() {
      const res =
        await ApiFetch.api.pendidikan.perpustakaandigital.dataperpustakaan[
          "findMany"
        ].get();
      if (res.status === 200) {
        dataPerpustakaan.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.DataPerpustakaanGetPayload<{
      include: {
        kategori: true;
        image: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          dataPerpustakaan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          dataPerpustakaan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        dataPerpustakaan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        dataPerpustakaan.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Data Perpustakaan berhasil dihapus");
          await dataPerpustakaan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus Data Perpustakaan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data Perpustakaan");
      } finally {
        dataPerpustakaan.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultDataPerpustakaan },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/${id}`,
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
            judul: data.judul,
            deskripsi: data.deskripsi,
            imageId: data.imageId,
            kategoriId: data.kategoriId,
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading perpustakaan digital:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateDataPerpustakaan.safeParse(
        dataPerpustakaan.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        dataPerpustakaan.update.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/dataperpustakaan/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              judul: this.form.judul,
              deskripsi: this.form.deskripsi,
              imageId: this.form.imageId,
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
          toast.success("Berhasil update data perpustakaan digital");
          await dataPerpustakaan.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal update data perpustakaan digital"
          );
        }
      } catch (error) {
        console.error("Error updating data perpustakaan digital:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data perpustakaan digital"
        );
        return false;
      } finally {
        dataPerpustakaan.update.loading = false;
      }
    },
    reset() {
      dataPerpustakaan.update.id = "";
      dataPerpustakaan.update.form = { ...defaultDataPerpustakaan };
    },
  },
});

const templateKategoriBuku = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultKategoriBuku = {
  name: "",
};

const kategoriBuku = proxy({
  create: {
    form: { ...defaultKategoriBuku },
    loading: false,
    async create() {
      const cek = templateKategoriBuku.safeParse(kategoriBuku.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kategoriBuku.create.loading = true;
        const res =
          await ApiFetch.api.pendidikan.perpustakaandigital.kategoribuku[
            "create"
          ].post(kategoriBuku.create.form);
        if (res.status === 200) {
          kategoriBuku.findMany.load();
          return toast.success("Data Kategori Buku Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        kategoriBuku.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.KategoriBukuGetPayload<{
      omit: {
        isActive: true;
      };
    }>[],
    loading: false,
    async load() {
      const res =
        await ApiFetch.api.pendidikan.perpustakaandigital.kategoribuku[
          "findMany"
        ].get();
      if (res.status === 200) {
        kategoriBuku.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriBukuGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          kategoriBuku.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kategoriBuku.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriBuku.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriBuku.delete.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/del/${id}`,
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
            result.message || "Data Kategori Buku berhasil dihapus"
          );
          await kategoriBuku.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus Data Kategori Buku");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data Kategori Buku");
      } finally {
        kategoriBuku.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultKategoriBuku },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/${id}`,
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
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori buku:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateKategoriBuku.safeParse(kategoriBuku.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kategoriBuku.update.loading = true;

        const response = await fetch(
          `/api/pendidikan/perpustakaandigital/kategoribuku/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
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
          toast.success("Berhasil update data kategori buku");
          await kategoriBuku.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update data kategori buku");
        }
      } catch (error) {
        console.error("Error updating data kategori buku:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data kategori buku"
        );
        return false;
      } finally {
        kategoriBuku.update.loading = false;
      }
    },
    reset() {
      kategoriBuku.update.id = "";
      kategoriBuku.update.form = { ...defaultKategoriBuku };
    },
  },
});

const perpustakaanDigitalState = proxy({
  dataPerpustakaan,
  kategoriBuku,
});

export default perpustakaanDigitalState;
