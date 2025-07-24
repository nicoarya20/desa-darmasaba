import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateapbDesaForm = z.object({
  name: z.string().min(1, "Judul minimal 1 karakter"),
  jumlah: z.string().min(1, "Deskripsi minimal 1 karakter"),
  imageId: z.string().min(1, "File minimal 1"),
  fileId: z.string().min(1, "File minimal 1"),
});

const defaultapbdesForm = {
  name: "",
  jumlah: "",
  imageId: "",
  fileId: "",
};

const apbdes = proxy({
  create: {
    form: { ...defaultapbdesForm },
    loading: false,
    async create() {
      const cek = templateapbDesaForm.safeParse(
        apbdes.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        apbdes.create.loading = true;
        const res = await ApiFetch.api.landingpage.apbdes[
          "create"
        ].post({
          ...apbdes.create.form,
        });

        if (res.status === 200) {
          apbdes.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        apbdes.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.APBDesGetPayload<{
        include: {
          image: true;
          file: true;
        };
      }>
    > | null,
    async load() {
      const res = await ApiFetch.api.landingpage.apbdes[
        "find-many"
      ].get();
      if (res.status === 200) {
        apbdes.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.APBDesGetPayload<{
      include: {
        image: true;
        file: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/landingpage/apbdes/${id}`);
        if (res.ok) {
          const data = await res.json();
          apbdes.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          apbdes.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        apbdes.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        apbdes.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/apbdes/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "apbdes berhasil dihapus");
          await apbdes.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus apbdes");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus apbdes");
      } finally {
        apbdes.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultapbdesForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        apbdes.edit.loading = true;

        const response = await fetch(`/api/landingpage/apbdes/${id}`, {
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
            jumlah: data.jumlah,
            imageId: data.imageId,
            fileId: data.fileId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading apbdes:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        apbdes.edit.loading = false;
      }
    },

    async update() {
      const cek = templateapbDesaForm.safeParse(
        apbdes.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        apbdes.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/apbdes/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              jumlah: this.form.jumlah,
              imageId: this.form.imageId,
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
          toast.success("Berhasil update apbdes");
          await apbdes.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate apbdes"
          );
        }
      } catch (error) {
        console.error("Error updating apbdes:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate apbdes"
        );
        return false;
      } finally {
        apbdes.edit.loading = false;
      }
    },
    reset() {
      apbdes.edit.id = "";
      apbdes.edit.form = { ...defaultapbdesForm };
    },
  },
});

export default apbdes;