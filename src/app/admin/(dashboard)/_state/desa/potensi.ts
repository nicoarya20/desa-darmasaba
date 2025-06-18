import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
    name: z.string().min(1).max(50),
    deskripsi: z.string().min(1).max(5000),
    kategori: z.string().min(1).max(50),
    imageId: z.string().min(1).max(50),
    content: z.string().min(1).max(5000),
})

const defaultForm = {
    name: "",
    deskripsi: "",
    kategori: "",
    imageId: "",
    content: "",
}

const potensiDesaState = proxy({
    create: {
        form: { ...defaultForm },
        loading: false,
        async create() {
            const cek = templateForm.safeParse(potensiDesaState.create.form);
            if (!cek.success) {
                const err = `[${cek.error.issues
                .map((v) => `${v.path.join(".")}`)
                .join("\n")}] required`;
                return toast.error(err);
            }
            try {
                potensiDesaState.create.loading = true;
                const res = await ApiFetch.api.desa.potensi["create"].post(potensiDesaState.create.form);
                if (res.status === 200) {
                    potensiDesaState.findMany.load();
                    return toast.success("Potensi berhasil disimpan!");
                }
                return toast.error("Gagal menyimpan potensi");
            } catch (error) {
                console.log((error as Error).message);
            } finally {
                potensiDesaState.create.loading = false;
            }
        }
    },
    findMany: {
        data: null as
        | Prisma.PotensiDesaGetPayload<{
            include: {
                image: true;
            }
        }>[]
        | null,
        async load() {
            const res = await ApiFetch.api.desa.potensi["find-many"].get();
            if (res.status === 200) {
                potensiDesaState.findMany.data = res.data?.data ?? [];
            }
        }
    },
    findUnique: {
        data: null as
        | Prisma.PotensiDesaGetPayload<{
            include: {
                image: true;
            }
        }> | null,
        async load(id: string) {
            try {
                const res = await fetch(`/api/desa/potensi/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    potensiDesaState.findUnique.data = data.data ?? null;
                } else {
                    console.error('Failed to fetch potensi:', res.statusText);
                    potensiDesaState.findUnique.data = null;
                }
            } catch (error) {
                console.error('Error fetching potensi:', error);
                potensiDesaState.findUnique.data = null;
            }
        },
    },
    delete: {
        loading: false,
        async byId(id: string) {
            if (!id) return toast.warn("ID tidak valid");
            
            try {
                potensiDesaState.delete.loading = true;
                
                const response = await fetch(`/api/desa/potensi/del/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                const result = await response.json();
                
                if (response.ok && result?.success) {
                    toast.success(result.message || "Potensi berhasil dihapus");
                    await potensiDesaState.findMany.load(); // refresh list
                } else {
                    toast.error(result?.message || "Gagal menghapus potensi");
                }
            } catch (error) {
                console.error("Gagal delete:", error);
                toast.error("Terjadi kesalahan saat menghapus potensi");
            } finally {
                potensiDesaState.delete.loading = false;
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
                const response = await fetch(`/api/desa/potensi/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
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
                        kategori: data.kategori,
                        imageId: data.imageId || "",
                        content: data.content,
                    };
                    return data; // Return the loaded data
                } else {
                    throw new Error(result?.message || "Gagal memuat data");
                }
            } catch (error) {
                console.error("Error loading potensi:", error);
                toast.error(error instanceof Error ? error.message : "Gagal memuat data");
                return null;
            }
        },

        async update() {
            const cek = templateForm.safeParse(potensiDesaState.edit.form);
            if (!cek.success) {
                const err = `[${cek.error.issues
                .map((v) => `${v.path.join(".")}`)
                .join("\n")}] required`;
                toast.error(err);
                return false;
            }

            try {
                potensiDesaState.edit.loading = true;

                const response = await fetch(`/api/desa/potensi/${this.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: this.form.name,
                        deskripsi: this.form.deskripsi,
                        kategori: this.form.kategori,
                        imageId: this.form.imageId,
                        content: this.form.content,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    toast.success("Berhasil update potensi");
                    await potensiDesaState.findMany.load(); // refresh list
                    return true;
                } else {
                    throw new Error(result.message || "Gagal update potensi");
                }
            } catch (error) {
                console.error("Error updating potensi:", error);
                toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat update potensi");
                return false;
            } finally {
                potensiDesaState.edit.loading = false;
            }
        },
        reset() {
            potensiDesaState.edit.id = "";
            potensiDesaState.edit.form = { ...defaultForm };
        }
    }
})

export default potensiDesaState

    