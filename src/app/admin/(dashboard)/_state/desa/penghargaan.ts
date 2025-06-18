import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1).max(50),
  juara: z.string().min(1).max(50),
  deskripsi: z.string().min(1).max(5000),
  imageId: z.string().min(1).max(50),
});

const defaultForm = {
  name: "",
  juara: "",
  deskripsi: "",
  imageId: "",
};

const penghargaanState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(penghargaanState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        penghargaanState.create.loading = true;
        const res = await ApiFetch.api.desa.penghargaan["create"].post(
          penghargaanState.create.form
        );
        if (res.status === 200) {
          penghargaanState.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        penghargaanState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.PenghargaanGetPayload<{
          include: {
            image: true;
          };
        }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.desa.penghargaan["find-many"].get();
      if (res.status === 200) {
        penghargaanState.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.PenghargaanGetPayload<{
      include: {
        image: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/desa/penghargaan/${id}`);
        if (res.ok) {
          const data = await res.json();
          penghargaanState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          penghargaanState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading penghargaan:", error);
        penghargaanState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        penghargaanState.delete.loading = true;
        const response = await fetch(`/api/desa/penghargaan/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();

        if (response.ok) {
          toast.success(result.message || "Penghargaan berhasil dihapus");
          await penghargaanState.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus penghargaan");
        }
      } catch (error) {
        console.log((error as Error).message);
        toast.error("Terjadi kesalahan saat menghapus penghargaan");
      } finally {
        penghargaanState.delete.loading = false;
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
        const response = await fetch(`/api/desa/penghargaan/${id}`, {
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
            juara: data.juara,
            deskripsi: data.deskripsi,
            imageId: data.imageId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading penghargaan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateForm.safeParse(penghargaanState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        penghargaanState.edit.loading = true;
        const response = await fetch(
          `/api/desa/penghargaan/${penghargaanState.edit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
              juara: this.form.juara,
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
          toast.success("Berhasil update penghargaan");
          await penghargaanState.findMany.load();
          return true;
        } else {
          throw new Error(result?.message || "Gagal update penghargaan");
        }
      } catch (error) {
        console.error("Error updating penghargaan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update penghargaan"
        );
        return false;
      } finally {
        penghargaanState.edit.loading = false;
      }
    },
    reset() {
      penghargaanState.edit.id = "";
      penghargaanState.edit.form = { ...defaultForm };
    },
  },
});
export default penghargaanState;