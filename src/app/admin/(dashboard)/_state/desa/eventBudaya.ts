/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  nama: z.string().min(1, "Nama event harus diisi"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  lokasi: z.string().min(1, "Lokasi harus diisi"),
  deskripsi: z.string().optional(),
});

const defaultForm = {
  nama: "",
  tanggal: "",
  lokasi: "",
  deskripsi: "",
};

const eventBudayaState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(eventBudayaState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        eventBudayaState.create.loading = true;
        const res = await ApiFetch.api.desa["eventbudaya"]["create"].post(
          eventBudayaState.create.form
        );
        if (res.status === 200 && res.data?.success) {
          eventBudayaState.findMany.load();
          toast.success("Event budaya berhasil disimpan!");
          eventBudayaState.create.form = { ...defaultForm };
          return true;
        }
        toast.error(res.data?.message || "Gagal menyimpan event budaya");
        return false;
      } catch (error) {
        console.error(error);
        toast.error("Gagal menyimpan event budaya");
        return false;
      } finally {
        eventBudayaState.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as Prisma.EventBudayaGetPayload<object>[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      eventBudayaState.findMany.loading = true;
      eventBudayaState.findMany.page = page;
      eventBudayaState.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.desa["eventbudaya"]["find-many"].get({ query });

        if (res.status === 200 && res.data?.success) {
          eventBudayaState.findMany.data = res.data.data ?? [];
          eventBudayaState.findMany.total = res.data.total ?? 0;
          eventBudayaState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          eventBudayaState.findMany.data = [];
          eventBudayaState.findMany.total = 0;
          eventBudayaState.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading event budaya:", error);
        eventBudayaState.findMany.data = [];
      } finally {
        eventBudayaState.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as Prisma.EventBudayaGetPayload<object> | null,
    loading: false,
    async load(id: string) {
      if (!id) return;
      this.loading = true;
      try {
        const res = await fetch(`/api/desa/eventbudaya/${id}`);
        if (res.ok) {
          const result = await res.json();
          eventBudayaState.findUnique.data = result.data ?? null;
        }
      } catch (error) {
        console.error("Error fetching event budaya:", error);
      } finally {
        this.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,

    async load(id: string) {
      if (!id) return;
      try {
        eventBudayaState.edit.loading = true;
        const res = await fetch(`/api/desa/eventbudaya/${id}`);
        const result = await res.json();
        if (result?.success) {
          const data = result.data;
          eventBudayaState.edit.id = data.id;
          eventBudayaState.edit.form = {
            nama: data.nama,
            tanggal: data.tanggal
              ? new Date(data.tanggal).toISOString().split("T")[0]
              : "",
            lokasi: data.lokasi,
            deskripsi: data.deskripsi ?? "",
          };
        }
      } catch (error) {
        console.error("Error loading event budaya for edit:", error);
      } finally {
        eventBudayaState.edit.loading = false;
      }
    },

    async save() {
      const cek = templateForm.safeParse(eventBudayaState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        eventBudayaState.edit.loading = true;
        const res = await fetch(
          `/api/desa/eventbudaya/${eventBudayaState.edit.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventBudayaState.edit.form),
          }
        );
        const result = await res.json();
        if (result.success) {
          toast.success("Event budaya berhasil diupdate");
          eventBudayaState.findMany.load();
          return true;
        }
        toast.error(result.message);
        return false;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        eventBudayaState.edit.loading = false;
      }
    },

    reset() {
      eventBudayaState.edit.id = "";
      eventBudayaState.edit.form = { ...defaultForm };
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        eventBudayaState.delete.loading = true;
        const res = await fetch(`/api/desa/eventbudaya/del/${id}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (res.ok && result?.success) {
          toast.success(result.message || "Event budaya berhasil dihapus");
          await eventBudayaState.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus event budaya");
        }
      } catch (error) {
        console.error(error);
        toast.error("Gagal menghapus event budaya");
      } finally {
        eventBudayaState.delete.loading = false;
      }
    },
  },
});

export default eventBudayaState;
