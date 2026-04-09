/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  nomor: z.string().min(1, { message: "Nomor is required" }),
  deskripsi: z.string().min(1, { message: "Deskripsi is required" }),
  imageId: z.string().nonempty(),
  jadwalPelayanan: z.string().min(1, { message: "Jadwal Pelayanan is required" }),
});

const defaultForm = {
  name: "",
  nomor: "",
  deskripsi: "",
  imageId: "",
  jadwalPelayanan: "",
};

const posyandustate = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
        const cek = templateForm.safeParse(posyandustate.create.form);
        if (!cek.success) {
            const err = `[${cek.error.issues
                .map((v) => `${v.path.join(".")}`)
                .join("\n")}] required`;
            return toast.error(err);
        }

        try {
            posyandustate.create.loading = true;
            const res = await ApiFetch.api.kesehatan.posyandu["create"].post(posyandustate.create.form);
            if (res.status === 200) {
                posyandustate.findMany.load();
                return toast.success("Posyandu berhasil disimpan!");
            }
            return toast.error("Gagal menyimpan posyandu");
        } catch (error) {
            console.log((error as Error).message);
        } finally {
            posyandustate.create.loading = false;
        }
    },
    resetForm(){
        posyandustate.create.form = { ...defaultForm };
    }
  },
  findMany: {
    data: null as
      | Prisma.PosyanduGetPayload<{
          include: {
            image: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
   load: async (page = 1, limit = 10, search = "") => {
      posyandustate.findMany.loading = true; // ✅ Akses langsung via nama path
      posyandustate.findMany.page = page;
      posyandustate.findMany.search = search;
  
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
    
        const res = await ApiFetch.api.kesehatan.posyandu["find-many"].get({ query });
    
        if (res.status === 200 && res.data?.success) {
          posyandustate.findMany.data = res.data.data ?? [];
          posyandustate.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          posyandustate.findMany.data = [];
          posyandustate.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch posyandu paginated:", err);
        posyandustate.findMany.data = [];
        posyandustate.findMany.totalPages = 1;
      } finally {
        posyandustate.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as 
    | Prisma.PosyanduGetPayload<{
        include: {
            image: true;
        }
    }> | null,
    async load(id: string) {
        try {
            const res = await fetch(`/api/kesehatan/posyandu/${id}`);
            if (res.ok) {
                const data = await res.json();
                posyandustate.findUnique.data = data.data ?? null;
            } else {
                console.error("Failed to fetch posyandu:", res.statusText);
                posyandustate.findUnique.data = null;
            }
        } catch (error) {
            console.error("Error fetching posyandu:", error);
            posyandustate.findUnique.data = null;
        }
    }
  },
  delete: {
    loading: false,
    async byId(id: string) {
      try {
        posyandustate.delete.loading = true;
        const response = await fetch(`/api/kesehatan/posyandu/del/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const result = await response.json();
        
        if (response.ok && result?.success) {
          toast.success(result.message || "Posyandu berhasil dihapus");
          await posyandustate.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus posyandu");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus posyandu");
      } finally {
        posyandustate.delete.loading = false;
      }
    }
  },
  edit: {
    id: "",
    form: {...defaultForm},
    loading: false,

    async load(id: string) {
        if(!id){
            toast.warn("ID tidak valid");
            return null;
        }

        try {
            const response = await fetch(`/api/kesehatan/posyandu/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if(result?.success){
                const data = result.data;
                this.id = data.id;
                this.form = {
                    name: data.name,
                    nomor: data.nomor,
                    deskripsi: data.deskripsi,
                    imageId: data.imageId || "",
                    jadwalPelayanan: data.jadwalPelayanan || "",
                };
                return data;
            } else {
                throw new Error(result?.message || "Gagal memuat data");
            }
        } catch (error) {
            console.error("Error fetching posyandu:", error);
            toast.error(error instanceof Error ? error.message : "Gagal memuat data");
            return null;
        }
    },
    async update() {
        const cek = templateForm.safeParse(posyandustate.edit.form);
        if(!cek.success){
            const err = `[${cek.error.issues
                .map((v) => `${v.path.join(".")}`)
                .join("\n")}] required`;
            toast.error(err);
            return false;
        }

        try {
            posyandustate.edit.loading = true;
            const response = await fetch(`/api/kesehatan/posyandu/${this.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: this.form.name,
                    nomor: this.form.nomor,
                    deskripsi: this.form.deskripsi,
                    imageId: this.form.imageId,
                    jadwalPelayanan: this.form.jadwalPelayanan,
                }),
            });
            
            if(!response.ok){
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if(result.success){
                toast.success(result.message || "Posyandu berhasil diperbarui");
                await posyandustate.findMany.load(); // refresh list
                return true;
            } else {
                throw new Error(result.message || "Gagal memuat data");
            }
        } catch (error) {
            console.error("Error fetching posyandu:", error);
            toast.error(error instanceof Error ? error.message : "Gagal memuat data");
            return false;
        } finally {
            posyandustate.edit.loading = false;
        }
    },

    reset() {
        posyandustate.edit.id = "";
        posyandustate.edit.form = {...defaultForm};
    }
  }
})

export default posyandustate;
