import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templatePelayananPerizinanBerusaha = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  link: z.string().min(3, "Link minimal 3 karakter"),
});

type pelayananPerizinanBerusahaForm =
  Prisma.PelayananPerizinanBerusahaGetPayload<{
    select: {
      id: true;
      name: true;
      deskripsi: true;
      link: true;
    };
  }>;

const pelayananPerizinanBerusahaDefaultForm = {
  name: "",
  deskripsi: "",
  link: "",
};

const pelayananPerizinanBerusaha = proxy({
  findById: {
    data: null as pelayananPerizinanBerusahaForm | null,
    loading: false,
    async load(id: string) {
      try {
        this.loading = true;
        const response = await fetch(`/api/desa/layanan/pelayananperizinanberusaha/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          this.data = result.data;
        }
        return result?.data || null;
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Gagal memuat data");
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...pelayananPerizinanBerusahaDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak boleh kosong");
        return null;
      }
      try {
        const response = await fetch(
          `/api/desa/layanan/pelayananperizinanberusaha/${id}`,
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
          pelayananPerizinanBerusaha.update.id = data.id;
          pelayananPerizinanBerusaha.update.form = {
            name: data.name,
            deskripsi: data.deskripsi,
            link: data.link,
          };
          return data;
        } else {
          throw new Error(result.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching pelayanan perizinan berusaha:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update(data: pelayananPerizinanBerusahaForm) {
      const cek = templatePelayananPerizinanBerusaha.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        pelayananPerizinanBerusaha.update.loading = true;
        const res = await fetch(
          `/api/desa/layanan/pelayananperizinanberusaha/${data.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        if (res.ok) {
          toast.success("Pelayanan perizinan berusaha berhasil diupdate");
          await pelayananPerizinanBerusaha.findById.load(data.id);
        } else {
          toast.error("Gagal mengupdate pelayanan perizinan berusaha");
        }
      } catch (error) {
        console.error("Error updating pelayanan perizinan berusaha:", error);
        toast.error(
          "Terjadi kesalahan saat mengupdate pelayanan perizinan berusaha"
        );
      } finally {
        pelayananPerizinanBerusaha.update.loading = false;
      }
    },
  },
});

export default pelayananPerizinanBerusaha;
