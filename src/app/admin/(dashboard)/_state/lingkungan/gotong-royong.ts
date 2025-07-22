import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateKegiatanDesaForm = z.object({
  judul: z.string().min(1, "Judul minimal 1 karakter"),
  deskripsiSingkat: z.string().min(1, "Deskripsi singkat minimal 1 karakter"),
  deskripsiLengkap: z.string().min(1, "Deskripsi lengkap minimal 1 karakter"),
  tanggal: z.date(),
  lokasi: z.string().min(1, "Lokasi minimal 1 karakter"),
  partisipan: z.number().min(1, "Partisipan minimal 1"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
  kategoriKegiatanId: z.string().min(1, "Kategori kegiatan minimal 1"),
});

const defaultKegiatanDesaForm = {
  judul: "",
  deskripsiSingkat: "",
  deskripsiLengkap: "",
  tanggal: new Date(),
  lokasi: "",
  partisipan: 0,
  imageId: "",
  kategoriKegiatanId: "",
};

const kegiatanDesa = proxy({
  create: {
    form: { ...defaultKegiatanDesaForm },
    loading: false,
    async create() {
      const cek = templateKegiatanDesaForm.safeParse(kegiatanDesa.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        kegiatanDesa.create.loading = true;
        const res = await ApiFetch.api.lingkungan.kegiatandesa["create"].post({
          ...kegiatanDesa.create.form,
          tanggal: kegiatanDesa.create.form.tanggal.toISOString(), // ✅ convert Date -> string
        });

        if (res.status === 200) {
          kegiatanDesa.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        kegiatanDesa.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.KegiatanDesaGetPayload<{
        include: {
          image: true;
          kategoriKegiatan: true;
        };
      }>
    > | null,
    async load() {
      const res = await ApiFetch.api.lingkungan.kegiatandesa["find-many"].get();
      if (res.status === 200) {
        kegiatanDesa.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.KegiatanDesaGetPayload<{
      include: {
        image: true;
        kategoriKegiatan: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/lingkungan/kegiatandesa/${id}`);
        if (res.ok) {
          const data = await res.json();
          kegiatanDesa.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kegiatanDesa.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kegiatanDesa.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kegiatanDesa.delete.loading = true;

        const response = await fetch(`/api/lingkungan/kegiatandesa/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "kegiatan desa berhasil dihapus");
          await kegiatanDesa.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus pasar desa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pasar desa");
      } finally {
        kegiatanDesa.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultKegiatanDesaForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        kegiatanDesa.edit.loading = true;

        const response = await fetch(`/api/lingkungan/kegiatandesa/${id}`, {
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
            deskripsiSingkat: data.deskripsiSingkat,
            deskripsiLengkap: data.deskripsiLengkap,
            tanggal: data.tanggal,
            lokasi: data.lokasi,
            partisipan: data.partisipan,
            imageId: data.imageId,
            kategoriKegiatanId: data.kategoriKegiatanId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kegiatan desa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        kegiatanDesa.edit.loading = false;
      }
    },

    async update() {
      const cek = templateKegiatanDesaForm.safeParse(kegiatanDesa.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        kegiatanDesa.edit.loading = true;
        const response = await fetch(
          `/api/lingkungan/kegiatandesa/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              judul: this.form.judul,
              deskripsiSingkat: this.form.deskripsiSingkat,
              deskripsiLengkap: this.form.deskripsiLengkap,
              tanggal:
                typeof this.form.tanggal === "string"
                  ? this.form.tanggal
                  : this.form.tanggal.toISOString(),
              lokasi: this.form.lokasi,
              partisipan: this.form.partisipan,
              imageId: this.form.imageId,
              kategoriKegiatanId: this.form.kategoriKegiatanId,
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
          toast.success("Berhasil update kegiatan desa");
          await kegiatanDesa.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate kegiatan desa");
        }
      } catch (error) {
        console.error("Error updating kegiatan desa:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate kegiatan desa"
        );
        return false;
      } finally {
        kegiatanDesa.edit.loading = false;
      }
    },
    reset() {
      kegiatanDesa.edit.id = "";
      kegiatanDesa.edit.form = { ...defaultKegiatanDesaForm };
    },
  },
});

// ========================================= KATEGORI kegiatan ========================================= //
const kategoriKegiatanForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
});

const kategoriKegiatanDefaultForm = {
  nama: "",
};

const kategoriKegiatan = proxy({
  create: {
    form: { ...kategoriKegiatanDefaultForm },
    loading: false,
    async create() {
      const cek = kategoriKegiatanForm.safeParse(kategoriKegiatan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        kategoriKegiatan.create.loading = true;
        const res = await ApiFetch.api.lingkungan.kategorikegiatan[
          "create"
        ].post(kategoriKegiatan.create.form);
        if (res.status === 200) {
          kategoriKegiatan.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        kategoriKegiatan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<{
      id: string;
      nama: string;
    }> | null,
    async load() {
      const res = await ApiFetch.api.lingkungan.kategorikegiatan[
        "find-many"
      ].get();
      if (res.status === 200) {
        kategoriKegiatan.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.KategoriKegiatanGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/lingkungan/kategorikegiatan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          kategoriKegiatan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          kategoriKegiatan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        kategoriKegiatan.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        kategoriKegiatan.delete.loading = true;

        const response = await fetch(
          `/api/lingkungan/kategorikegiatan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Kategori kegiatan berhasil dihapus");
          await kategoriKegiatan.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus kategori kegiatan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus kategori kegiatan");
      } finally {
        kategoriKegiatan.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...kategoriKegiatanDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/lingkungan/kategorikegiatan/${id}`,
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
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading kategori kegiatan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = kategoriKegiatanForm.safeParse(kategoriKegiatan.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        kategoriKegiatan.edit.loading = true;
        const response = await fetch(
          `/api/lingkungan/kategorikegiatan/${kategoriKegiatan.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: kategoriKegiatan.edit.form.nama,
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
                `Gagal mengupdate kategori kegiatan (${response.status})`
            );
          }

          if (result.success) {
            toast.success(
              result.message || "Berhasil memperbarui kategori kegiatan"
            );
            await kategoriKegiatan.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(
              result.message || "Gagal mengupdate kategori kegiatan"
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
        console.error("Error updating kategori kegiatan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate kategori kegiatan"
        );
        return false;
      } finally {
        kategoriKegiatan.edit.loading = false;
      }
    },
    reset() {
      kategoriKegiatan.edit.id = "";
      kategoriKegiatan.edit.form = { ...kategoriKegiatanDefaultForm };
    },
  },
});

const gotongRoyongState = proxy({
  kegiatanDesa,
  kategoriKegiatan,
});
export default gotongRoyongState;
