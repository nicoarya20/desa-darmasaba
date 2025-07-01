import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  imageId: z.string().nonempty(),
});

const defaultForm = {
  name: "",
  deskripsi: "",
  imageId: "",
};

const keamananLingkunganState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(keamananLingkunganState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        keamananLingkunganState.create.loading = true;
        const res = await ApiFetch.api.keamanan.keamananlingkungan[
          "create"
        ].post(keamananLingkunganState.create.form);
        if (res.status === 200) {
          keamananLingkunganState.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        keamananLingkunganState.create.loading = false;
      }
    },
    resetForm() {
      keamananLingkunganState.create.form = { ...defaultForm };
    },
  },
  findMany: {
    data: null as
      | Prisma.KeamananLingkunganGetPayload<{
          include: { image: true };
        }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.keamanan.keamananlingkungan[
        "find-many"
      ].get();
      if (res.status === 200) {
        keamananLingkunganState.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.KeamananLingkunganGetPayload<{
      include: { image: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/keamanan/keamananlingkungan/${id}`);
        if (res.ok) {
          const data = await res.json();
          keamananLingkunganState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          keamananLingkunganState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        keamananLingkunganState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        keamananLingkunganState.delete.loading = true;

        const response = await fetch(
          `/api/keamanan/keamananlingkungan/del/${id}`,
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
            result.message || "Keamanan ingkungan berhasil dihapus"
          );
          await keamananLingkunganState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus keamanan ingkungan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus keamanan ingkungan");
      } finally {
        keamananLingkunganState.delete.loading = false;
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
        const response = await fetch(`/api/keamanan/keamananlingkungan/${id}`, {
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
            imageId: data.imageId || "",
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading keamanan lingkungan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(keamananLingkunganState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        keamananLingkunganState.edit.loading = true;

        const response = await fetch(`/api/keamanan/keamananlingkungan/${this.id}`, {
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
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update keamanan lingkungan");
          await keamananLingkunganState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update keamanan lingkungan");
        }
      } catch (error) {
        console.error("Error updating keamanan lingkungan:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update keamanan lingkungan"
        );
        return false;
      } finally {
        keamananLingkunganState.edit.loading = false;
      }
    },
    reset() {
      keamananLingkunganState.edit.id = "";
      keamananLingkunganState.edit.form = { ...defaultForm };
    },
  },
});

export default keamananLingkunganState;
