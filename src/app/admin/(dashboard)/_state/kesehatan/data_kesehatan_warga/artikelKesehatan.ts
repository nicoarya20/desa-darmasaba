/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  content: z.string().min(1, "Content harus diisi"),
  introduction: z.object({
    content: z.string().min(1, "Content harus diisi"),
  }),
  symptom: z.object({
    title: z.string().min(1, "Judul harus diisi"),
    content: z.string().min(1, "Content harus diisi"),
  }),
  prevention: z.object({
    title: z.string().min(1, "Judul harus diisi"),
    content: z.string().min(1, "Content harus diisi"),
  }),
  firstAid: z.object({
    title: z.string().min(1, "Judul harus diisi"),
    content: z.string().min(1, "Content harus diisi"),
  }),
  mythVsFact: z.object({
    title: z.string().min(1, "Judul harus diisi"),
    mitos: z.string().min(1, "Mitos harus diisi"),
    fakta: z.string().min(1, "Fakta harus diisi"),
  }),
  doctorSign: z.object({
    content: z.string().min(1, "Content harus diisi"),
  }),
});

const defaultForm = {
  title: "",
  content: "",
  introduction: {
    content: "",
  },
  symptom: {
    title: "",
    content: "",
  },
  prevention: {
    title: "",
    content: "",
  },
  firstAid: {
    title: "",
    content: "",
  },
  mythVsFact: {
    title: "",
    mitos: "",
    fakta: "",
  },
  doctorSign: {
    content: "",
  },
};

const artikelKesehatanState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async submit() {
      const cek = templateForm.safeParse(this.form);
      if (!cek.success) {
        const errMsg = cek.error.issues
          .map((v) => `${v.path.join(".")}: ${v.message}`)
          .join("\n");
        toast.error(errMsg);
        return null;
      }

      try {
        this.loading = true;
        const payload = { ...this.form };

        const res = await (ApiFetch.api.kesehatan as any)[
          "artikel-kesehatan"
        ].create.post(payload);

        if (res.status === 200) {
          toast.success("Berhasil menambahkan artikel kesehatan");
          this.resetForm();
          await artikelKesehatanState.findMany.load();
          return res.data;
        }
      } catch (err: any) {
        const msg = err?.message || "Terjadi kesalahan saat mengirim data";
        toast.error(msg);
        console.error("SUBMIT ERROR:", err);
        return null;
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.form = { ...defaultForm };
    },
  },
  findMany: {
    data: null as
      | Prisma.ArtikelKesehatanGetPayload<{
          include: {
            introduction: true;
            symptom: true;
            prevention: true;
            firstaid: true;
            mythvsfact: true;
            doctorsign: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      artikelKesehatanState.findMany.loading = true; // ✅ Akses langsung via nama path
      artikelKesehatanState.findMany.page = page;
      artikelKesehatanState.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.kesehatan["artikel-kesehatan"][
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          artikelKesehatanState.findMany.data =
            res.data.data ?? [];
          artikelKesehatanState.findMany.totalPages =
            res.data.totalPages ?? 1;
        } else {
          artikelKesehatanState.findMany.data = [];
          artikelKesehatanState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch artikel kesehatan paginated:", err);
        artikelKesehatanState.findMany.data = [];
        artikelKesehatanState.findMany.totalPages = 1;
      } finally {
        artikelKesehatanState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.ArtikelKesehatanGetPayload<{
      include: {
        introduction: true;
        symptom: true;
        prevention: true;
        firstaid: true;
        mythvsfact: true;
        doctorsign: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      const res = await fetch(`/api/kesehatan/artikel-kesehatan/${id}`);
      if (res.ok) {
        const data = await res.json();
        artikelKesehatanState.findUnique.data = data.data ?? null;
      } else {
        toast.error("Gagal load data artikel kesehatan");
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      const res = await fetch(`/api/kesehatan/artikel-kesehatan/${id}`);
      if (!res.ok) {
        toast.error("Gagal load data artikel kesehatan");
        return;
      }

      const result = await res.json();
      const data = result.data;

      artikelKesehatanState.edit.id = data.id;
      artikelKesehatanState.edit.form = {
        title: data.title,
        content: data.content,
        introduction: {
          content: data.introduction.content,
        },
        symptom: {
          title: data.symptom.title,
          content: data.symptom.content,
        },
        prevention: {
          title: data.prevention.title,
          content: data.prevention.content,
        },
        firstAid: {
          title: data.firstaid.title,
          content: data.firstaid.content,
        },
        mythVsFact: {
          title: data.mythvsfact.title,
          mitos: data.mythvsfact.mitos,
          fakta: data.mythvsfact.fakta,
        },
        doctorSign: {
          content: data.doctorsign.content,
        },
      };
    },
    async submit() {
      const cek = templateForm.safeParse(artikelKesehatanState.edit.form);
      if (!cek.success) {
        const errMsg = cek.error.issues
          .map((v) => `${v.path.join(".")}: ${v.message}`)
          .join("\n");
        toast.error(errMsg);
        return null;
      }

      try {
        artikelKesehatanState.edit.loading = true;
        const payload = {
          title: artikelKesehatanState.edit.form.title,
          content: artikelKesehatanState.edit.form.content,
          introduction: {
            content: artikelKesehatanState.edit.form.introduction.content,
          },
          symptom: {
            title: artikelKesehatanState.edit.form.symptom.title,
            content: artikelKesehatanState.edit.form.symptom.content,
          },
          prevention: {
            title: artikelKesehatanState.edit.form.prevention.title,
            content: artikelKesehatanState.edit.form.prevention.content,
          },
          firstAid: {
            title: artikelKesehatanState.edit.form.firstAid.title,
            content: artikelKesehatanState.edit.form.firstAid.content,
          },
          mythVsFact: {
            title: artikelKesehatanState.edit.form.mythVsFact.title,
            mitos: artikelKesehatanState.edit.form.mythVsFact.mitos,
            fakta: artikelKesehatanState.edit.form.mythVsFact.fakta,
          },
          doctorSign: {
            content: artikelKesehatanState.edit.form.doctorSign.content,
          },
        };

        const res = await fetch(
          `/api/kesehatan/artikel-kesehatan/${artikelKesehatanState.edit.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Update gagal");
        }

        toast.success("Berhasil update artikel kesehatan");
        await artikelKesehatanState.findMany.load();
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Terjadi kesalahan saat update"
        );
        return false;
      } finally {
        artikelKesehatanState.edit.loading = false;
      }
    },
    resetForm() {
      artikelKesehatanState.edit.id = "";
      artikelKesehatanState.edit.form = { ...defaultForm };
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      try {
        artikelKesehatanState.delete.loading = true;
        const res = await fetch(`/api/kesehatan/artikel-kesehatan/del/${id}`, {
          method: "DELETE",
        });

        const result = await res.json();
        if (res.ok && result.success) {
          toast.success("Artikel kesehatan berhasil dihapus");
          await artikelKesehatanState.findMany.load();
        } else {
          toast.error(result.message || "Gagal menghapus");
        }
      } catch {
        toast.error("Terjadi kesalahan saat menghapus");
      } finally {
        artikelKesehatanState.delete.loading = false;
      }
    },
  },
});

export default artikelKesehatanState;
