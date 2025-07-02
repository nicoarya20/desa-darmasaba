import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  imageId: z.string().nonempty(),
  kontakItems: z.array(
    z.object({
      nama: z.string().min(1, "Nama minimal 1 karakter"),
      nomorTelepon: z.string().min(1, "Nomor Telepon minimal 1 karakter"),
      imageId: z.string().nonempty(),
    })
  ),
});

const defaultForm = {
  nama: "",
  imageId: "",
  kontakItems: [
    {
      nama: "",
      nomorTelepon: "",
      imageId: "",
    },
  ],
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
    data: null as
      | Prisma.KontakDaruratKeamananGetPayload<{
          include: {
            kontakItems: true;
            image: true;
          };
        }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.keamanan.kontakdaruratkeamanan[
        "find-many"
      ].get();
      if (res.status === 200) {
        kontakDaruratKeamananState.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.KontakDaruratKeamananGetPayload<{
      include: {
        kontakItems: {
          include: {
            image: true;
          };
        };
        image: true;
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
            imageId: data.imageId,
            kontakItems: [
              {
                nama: data.kontakItems.nama,
                nomorTelepon: data.kontakItems.nomorTelepon,
                imageId: data.kontakItems.imageId,
              },
            ],
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
              imageId: this.form.imageId,
              kontakItems: [
                {
                  nama: this.form.kontakItems[0].nama,
                  nomorTelepon: this.form.kontakItems[0].nomorTelepon,
                  imageId: this.form.kontakItems[0].imageId,
                },
              ],
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

export default kontakDaruratKeamananState;
