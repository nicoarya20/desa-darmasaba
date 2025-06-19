import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// Schema validasi
const templateForm = z.object({
  name: z.string().min(1),
  alamat: z.string().min(1),
  imageId: z.string().min(1),
  jam: z.object({
    workDays: z.string().min(1),
    weekDays: z.string().min(1),
    holiday: z.string().min(1),
  }),
  kontak: z.object({
    kontakPuskesmas: z.string().min(1),
    email: z.string().min(1),
    facebook: z.string().min(1),
    kontakUGD: z.string().min(1),
  }),
});

// Default form
const defaultForm = {
  name: "",
  alamat: "",
  imageId: "",
  jam: {
    workDays: "",
    weekDays: "",
    holiday: "",
  },
  kontak: {
    kontakPuskesmas: "",
    email: "",
    facebook: "",
    kontakUGD: "",
  }
};

const puskesmasState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async submit() {
      const cek = templateForm.safeParse(puskesmasState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => v.path.join(".")).join(", ")}] required`;
        return toast.error(err);
      }

      try {
        puskesmasState.create.loading = true;
        const formData = {
          ...puskesmasState.create.form,
          kontak: {
            ...puskesmasState.create.form.kontak,
            jam: puskesmasState.create.form.jam
          }
        };
        const res = await ApiFetch.api.kesehatan.puskesmas.create.post(formData);
        if (res.status === 200) {
          puskesmasState.findMany.load();
          toast.success("Berhasil menambahkan puskesmas");
        } else {
          toast.error("Gagal tambah puskesmas");
        }
      } catch (err) {
        toast.error("Terjadi kesalahan saat tambah");
        console.error(err);
      } finally {
        puskesmasState.create.loading = false;
      }
    },
    resetForm() {
      puskesmasState.create.form = { ...defaultForm };
    }
  },

  findMany: {
    data: null as
      | Prisma.PuskesmasGetPayload<{
          include: { image: true; jam: true; kontak: true };
        }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.puskesmas["find-many"].get();
      if (res.status === 200) {
        puskesmasState.findMany.data = res.data?.data ?? [];
      }
    },
  },

  findUnique: {
    data: null as
      | Prisma.PuskesmasGetPayload<{
          include: { image: true; jam: true; kontak: true };
        }>
      | null,
    async load(id: string) {
      const res = await fetch(`/api/kesehatan/puskesmas/${id}`);
      if (res.ok) {
        const data = await res.json();
        puskesmasState.findUnique.data = data.data ?? null;
      } else {
        toast.error("Gagal load data puskesmas");
      }
    },
  },

  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,

    async load(id: string) {
      const res = await fetch(`/api/kesehatan/puskesmas/${id}`);
      if (!res.ok) {
        toast.error("Gagal memuat data");
        return;
      }

      const result = await res.json();
      const data = result.data;

      puskesmasState.edit.id = data.id;
      puskesmasState.edit.form = {
        name: data.name,
        alamat: data.alamat,
        imageId: data.imageId,
        jam: {
          workDays: data.jam.workDays,
          weekDays: data.jam.weekDays,
          holiday: data.jam.holiday,
        },
        kontak: {
          kontakPuskesmas: data.kontak.kontakPuskesmas,
          email: data.kontak.email,
          facebook: data.kontak.facebook,
          kontakUGD: data.kontak.kontakUGD,
        }
      };
    },

    async submit() {
      const cek = templateForm.safeParse(puskesmasState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues.map((v) => v.path.join(".")).join(", ")}] required`;
        toast.error(err);
        return false;
      }

      try {
        puskesmasState.edit.loading = true;
        const formData = {
          ...puskesmasState.edit.form,
          kontak: {
            ...puskesmasState.edit.form.kontak,
            jam: puskesmasState.edit.form.jam
          }
        };
        const res = await fetch(`/api/kesehatan/puskesmas/${puskesmasState.edit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Update gagal");
        }

        toast.success("Berhasil update puskesmas");
        await puskesmasState.findMany.load();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Terjadi kesalahan saat update");
        return false;
      } finally {
        puskesmasState.edit.loading = false;
      }
    },

    reset() {
      puskesmasState.edit.id = "";
      puskesmasState.edit.form = { ...defaultForm };
    }
  },

  delete: {
    loading: false,
    async byId(id: string) {
      try {
        puskesmasState.delete.loading = true;
        const res = await fetch(`/api/kesehatan/puskesmas/del/${id}`, {
          method: "DELETE",
        });

        const result = await res.json();
        if (res.ok && result.success) {
          toast.success("Puskesmas berhasil dihapus");
          await puskesmasState.findMany.load();
        } else {
          toast.error(result.message || "Gagal menghapus");
        }
      } catch {
        toast.error("Terjadi kesalahan saat menghapus");
      } finally {
        puskesmasState.delete.loading = false;
      }
    }
  }
});

export default puskesmasState;
