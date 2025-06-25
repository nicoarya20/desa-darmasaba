import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
    name: z.string().min(3, "Judul minimal 3 karakter"),
    deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
    imageId: z.string().nonempty(),
})

const defaultForm = {
    name: "",
    deskripsi: "",
    imageId: "",
}

const penangananDarurat = proxy({
    findMany: {
        data: [] as Prisma.PenangananDaruratGetPayload<{
            include: {
                image: true;
            };
        }>[],
        async load() {
            const res = await ApiFetch.api.kesehatan.penanganandarurat[
                "find-many"
            ].get();
            if (res.status === 200) {
                penangananDarurat.findMany.data = res.data?.data ?? [];
            }
        },
    },
    create:{
        form: {...defaultForm},
        loading: false,
        async create() {
            const cek = templateForm.safeParse(penangananDarurat.create.form);
            if (!cek.success) {
                const err = `[${cek.error.issues
                    .map((v) => `${v.path.join(".")}`)
                    .join("\n")}] required`;
                return toast.error(err);
            }

            try {
                penangananDarurat.create.loading = true;
                const res = await ApiFetch.api.kesehatan.penanganandarurat[
                    "create"
                ].post(penangananDarurat.create.form);
                if (res.status === 200) {
                    penangananDarurat.findMany.load();
                    return toast.success("Penanganan Darurat berhasil disimpan!");
                }

                return toast.error("Gagal menyimpan penanganan darurat");
            } catch (error) {
                console.log((error as Error).message);
            } finally {
                penangananDarurat.create.loading = false;
            }
        },
        resetForm() {
            penangananDarurat.create.form = {...defaultForm};
        }
    },
    findUnique: {
        data: null as Prisma.PenangananDaruratGetPayload<{
            include: {
                image: true;
            };
        }> | null,
        async load(id: string) {
           try {
            const res = await fetch(`/api/kesehatan/penanganandarurat/${id}`);
            if (res.ok) {
                const data = await res.json();
                penangananDarurat.findUnique.data = data.data ?? null;
            } else {
                console.error("Failed to fetch data", res.status, res.statusText);
                penangananDarurat.findUnique.data = null;
            }
           } catch (error) {
            console.error("Error fetching data:", error);
            penangananDarurat.findUnique.data = null;
           }
        },
    },
    delete: {
        loading: false,
        async byId(id: string) {
          try {
            penangananDarurat.delete.loading = true;
            const response = await fetch(`/api/kesehatan/penanganandarurat/del/${id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            const result = await response.json();
            
            if (response.ok && result?.success) {
              toast.success(result.message || "Penanganan darurat berhasil dihapus");
              await penangananDarurat.findMany.load(); // refresh list
            } else {
              toast.error(result?.message || "Gagal menghapus penanganan darurat");
            }
          } catch (error) {
            console.error("Gagal delete:", error);
            toast.error("Terjadi kesalahan saat menghapus penanganan darurat");
          } finally {
            penangananDarurat.delete.loading = false;
          }
        }
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
            const response = await fetch(`/api/kesehatan/penanganandarurat/${id}`, {
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
                imageId: data.imageId,
              };
              return data; // Return the loaded data
            } else {
              throw new Error(result?.message || "Gagal memuat data");
            }
          } catch (error) {
            console.error("Error fetching penanganan darurat:", error);
            toast.error(error instanceof Error ? error.message : "Gagal memuat data");
            return null;
          }
        },
    
        async update() {
            const cek = templateForm.safeParse(penangananDarurat.edit.form);
            if (!cek.success) {
                const err = `[${cek.error.issues
                    .map((v) => `${v.path.join(".")}`)
                    .join("\n")}] required`;
                return toast.error(err);
            }
    
            try {
                penangananDarurat.edit.loading = true;
                const response = await fetch(`/api/kesehatan/penanganandarurat/${this.id}`, {
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
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.success) {
                    toast.success(result.message || "Penanganan darurat berhasil diupdate");
                    await penangananDarurat.findMany.load();  
                    return true;
                } else {
                    throw new Error(result.message || "Gagal update penanganan darurat");
                }
            } catch (error) {
                console.error("Gagal update:", error);
                toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat mengupdate penanganan darurat");
                return false;
            } finally {
                penangananDarurat.edit.loading = false;
            }
        },
        reset() {
            penangananDarurat.edit.id = "";
            penangananDarurat.edit.form = { ...defaultForm };
        },
      },
});

export default penangananDarurat
