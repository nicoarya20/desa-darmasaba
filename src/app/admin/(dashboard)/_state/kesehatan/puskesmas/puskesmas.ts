import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// Validasi form
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
  },
  image: undefined,
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

        console.log('Form data:', puskesmasState.create.form);
        interface ErrorResponse {
          message?: string;
          error?: string;
          errors?: Record<string, string[]>;
        }

        const payload = {
            name: puskesmasState.create.form.name,
            alamat: puskesmasState.create.form.alamat,
            imageId: puskesmasState.create.form.imageId,
            jam: {
              workDays: puskesmasState.create.form.jam.workDays,
              weekDays: puskesmasState.create.form.jam.weekDays,
              holiday: puskesmasState.create.form.jam.holiday,
            },
            kontak: {
              kontakPuskesmas: puskesmasState.create.form.kontak.kontakPuskesmas,
              email: puskesmasState.create.form.kontak.email,
              facebook: puskesmasState.create.form.kontak.facebook,
              kontakUGD: puskesmasState.create.form.kontak.kontakUGD,
            },
          };
          
          
          

        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        try {
          const res = await ApiFetch.api.kesehatan.puskesmas.create.post(payload);
          console.log('API Response:', res);

          if (res.status === 200) {
            await puskesmasState.findMany.load();
            toast.success("Berhasil menambahkan puskesmas");
            return res;
          } else {
            console.error('API Error Response:', {
              status: res.status,
              data: res.data
            });
            
            const errorData = res.data as ErrorResponse;
            let errorMessage = 'Gagal menambahkan puskesmas';
            
            if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (errorData?.error) {
              errorMessage = errorData.error;
            } else if (errorData?.errors) {
              errorMessage = Object.entries(errorData.errors)
                .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                .join('; ');
            }
            
            console.error('Extracted error message:', errorMessage);
            toast.error(errorMessage);
            throw new Error(errorMessage);
          }
        } catch (error) {
          console.error('Error in API call:', {
            error,
            errorString: String(error),
            jsonError: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            } : 'Not an Error instance'
          });
          throw error;
        }
      } catch (error) {
        console.error("Error in puskesmas submit:", {
          error,
          errorString: String(error),
          errorType: typeof error,
          isErrorInstance: error instanceof Error,
          errorDetails: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause
          } : null
        });
        
        let errorMessage = "Terjadi kesalahan saat menambahkan puskesmas";
        if (error instanceof Error) {
          errorMessage = error.message || errorMessage;
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = String((error as { message: unknown }).message);
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        console.error('Displaying error to user:', errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        puskesmasState.create.loading = false;
      }
    },
    resetForm() {
      puskesmasState.create.form = { ...defaultForm };
    }
  },

  findMany: {
    data: null as Prisma.PuskesmasGetPayload<{
      include: { image: true; jam: true; kontak: true };
    }>[] | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.puskesmas["find-many"].get();
      if (res.status === 200) {
        puskesmasState.findMany.data = res.data?.data ?? [];
      }
    },
  },

  findUnique: {
    data: null as Prisma.PuskesmasGetPayload<{
      include: { image: true; jam: true; kontak: true };
    }> | null,
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
        },
        image: data.image,
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
        const payload = {
          name: puskesmasState.edit.form.name,
          alamat: puskesmasState.edit.form.alamat,
          imageId: puskesmasState.edit.form.imageId,
          jam: { ...puskesmasState.edit.form.jam },
          kontak: { ...puskesmasState.edit.form.kontak }
        };

        const res = await fetch(`/api/kesehatan/puskesmas/${puskesmasState.edit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
