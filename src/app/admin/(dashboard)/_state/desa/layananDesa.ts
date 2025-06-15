import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateSuratKeteranganForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  imageId: z.string().nonempty(),
});

const suratKeteranganForm = {
  name: "",
  deskripsi: "",
  imageId: "",
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
    data: [] as Prisma.PelayananSuratKeteranganGetPayload<{
      include: { image: true };
    }>[],
    async load() {
      const res = await ApiFetch.api.desa.layanan.pelayanansuratketerangan[
        "find-many"
      ].get();
      if (res.status === 200) {
        suratKeterangan.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.PelayananSuratKeteranganGetPayload<{
      include: {
        image: true;
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
        const response = await fetch(
          `/api/desa/layanan/pelayanansuratketerangan/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          toast.success(result.message || "Surat Keterangan berhasil dihapus");
          await suratKeterangan.findMany.load(); // refresh list
        } else {
          toast.error(result.message || "Gagal menghapus surat keterangan");
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
        const response = await fetch(`/api/desa/layanan/pelayanansuratketerangan/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.form.name,
            deskripsi: this.form.deskripsi,
            imageId: this.form.imageId,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          toast.success(result.message || "Surat Keterangan berhasil diupdate");
          await suratKeterangan.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate surat keterangan");
        }
      } catch (error) {
        console.error("Error updating surat keterangan:", error);
        toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat update surat keterangan");
        return false;
      } finally {
        suratKeterangan.edit.loading = false;
      }
    },
  },
});

const stateLayananDesa = proxy({
  suratKeterangan,
});

export default stateLayananDesa;

