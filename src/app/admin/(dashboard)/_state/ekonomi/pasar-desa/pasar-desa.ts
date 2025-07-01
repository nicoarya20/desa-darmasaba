import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  harga: z.number().min(1, "Harga minimal 1"),
  satuan: z.string().min(3, "Satuan minimal 3 karakter"),
  alamat: z.string().min(3, "Alamat minimal 3 karakter"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
  rating: z.number().min(1, "Rating minimal 1"),
  kategoriId: z.string().min(1, "Kategori wajib dipilih"),
});

const defaultForm = {
  nama: "",
  harga: 0,
  satuan: "",
  alamat: "",
  imageId: "",
  rating: 0,
  kategoriId: "",
};

const pasarDesaState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(pasarDesaState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        pasarDesaState.create.loading = true;
        const res = await ApiFetch.api.ekonomi.pasardesa["create"].post(
          pasarDesaState.create.form
        );
        if (res.status === 200) {
          pasarDesaState.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        pasarDesaState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.PasarDesaGetPayload<{
          include: { kategori: true; image: true };
        }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.ekonomi.pasardesa["find-many"].get();
      if (res.status === 200) {
        pasarDesaState.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.PasarDesaGetPayload<{
      include: { kategori: true; image: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/ekonomi/pasardesa/${id}`);
        if (res.ok) {
          const data = await res.json();
          pasarDesaState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          pasarDesaState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        pasarDesaState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pasarDesaState.delete.loading = true;

        const response = await fetch(`/api/ekonomi/pasardesa/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Pasar desa berhasil dihapus");
          await pasarDesaState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus pasar desa");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pasar desa");
      } finally {
        pasarDesaState.delete.loading = false;
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
          const response = await fetch(`/api/ekonomi/pasardesa/${id}`, {
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
              harga: data.harga,
              satuan: data.satuan,
              alamat: data.alamat,
              imageId: data.imageId,
              rating: data.rating,
              kategoriId: data.kategoriId,
            };
            return data;
          } else {
            throw new Error(result?.message || "Gagal memuat data");
          }
        } catch (error) {
          console.error("Error loading pasar desa:", error);
          toast.error(
            error instanceof Error ? error.message : "Gagal memuat data"
          );
          return null;
        }
      },
  
      async update() {
        const cek = templateForm.safeParse(pasarDesaState.edit.form);
        if (!cek.success) {
          const err = `[${cek.error.issues
            .map((v) => `${v.path.join(".")}`)
            .join("\n")}] required`;
          return toast.error(err);
        }
  
        try {
          pasarDesaState.edit.loading = true;
          const response = await fetch(
            `/api/ekonomi/pasardesa/${this.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                nama: this.form.nama,
                harga: this.form.harga,
                satuan: this.form.satuan,
                alamat: this.form.alamat,
                imageId: this.form.imageId,
                rating: this.form.rating,
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
            toast.success("Berhasil update pasar desa");
            await pasarDesaState.findMany.load(); // refresh list
            return true;
          } else {
            throw new Error(result.message || "Gagal mengupdate pasar desa");
          }
        } catch (error) {
          console.error("Error updating pasar desa:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Gagal mengupdate pasar desa"
          );
          return false;
        } finally {
          pasarDesaState.edit.loading = false;
        }
      },
      reset() {
        pasarDesaState.edit.id = "";
        pasarDesaState.edit.form = { ...defaultForm };
      },
    },
});

export default pasarDesaState;
