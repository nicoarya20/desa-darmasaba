import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePelayananPendudukNonPermanen = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type pelayananPendudukNonPermanenForm =
  Prisma.PelayananPendudukNonPermanenGetPayload<{
    select: {
      id: true;
      name: true;
      deskripsi: true;
    };
  }>;

const pelayananPendudukNonPermanenDefaultForm = {
  name: "",
  deskripsi: "",
};

const pelayananPendudukNonPermanen = proxy({
  findById: {
    data: null as pelayananPendudukNonPermanenForm | null,
    loading: false,
    initialize() {
      pelayananPendudukNonPermanen.findById.data = {
        id: "",
        name: "",
        deskripsi: "",
      } as pelayananPendudukNonPermanenForm;
    },
    async load(id: string) {
      try {
        pelayananPendudukNonPermanen.findById.loading = true;
        const res = await fetch(
          `/api/desa/layanan/pelayananpenduduknonpermanen/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          pelayananPendudukNonPermanen.findById.data = data.data ?? null;
        } else {
          console.error(
            "Failed to fetch pelayanan penduduk non permanen:",
            res.statusText
          );
          pelayananPendudukNonPermanen.findById.data = null;
        }
      } catch (error) {
        console.error("Error fetching pelayanan penduduk non permanen:", error);
        pelayananPendudukNonPermanen.findById.data = null;
      } finally {
        pelayananPendudukNonPermanen.findById.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...pelayananPendudukNonPermanenDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak boleh kosong");
        return null;
      }
      try {
        const response = await fetch(
          `/api/desa/layanan/pelayananpenduduknonpermanen/${id}`,
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
          pelayananPendudukNonPermanen.update.id = data.id;
          pelayananPendudukNonPermanen.update.form = {
            name: data.name,
            deskripsi: data.deskripsi,
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching pelayanan penduduk non permanen:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update(data: pelayananPendudukNonPermanenForm) {
      const cek = templatePelayananPendudukNonPermanen.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        pelayananPendudukNonPermanen.update.loading = true;
        const res = await fetch(
          `/api/desa/layanan/pelayananpenduduknonpermanen/${data.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        if (res.ok) {
          toast.success("Pelayanan penduduk non permanen berhasil diupdate");
          await pelayananPendudukNonPermanen.findById.load(data.id);
        } else {
          toast.error("Gagal mengupdate pelayanan penduduk non permanen");
        }
      } catch (error) {
        console.error("Error updating pelayanan penduduk non permanen:", error);
        toast.error(
          "Terjadi kesalahan saat mengupdate pelayanan penduduk non permanen"
        );
      } finally {
        pelayananPendudukNonPermanen.update.loading = false;
      }
    },
  },
});

export default pelayananPendudukNonPermanen;
