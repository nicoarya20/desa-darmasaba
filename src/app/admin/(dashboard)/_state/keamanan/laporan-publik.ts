/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

export type Status = "Selesai" | "Proses" | "Gagal";

const templateForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  lokasi: z.string().min(3, "Lokasi minimal 3 karakter"),
  tanggalWaktu: z.string().min(3, "Tanggal Waktu minimal 3 karakter"),
  status: z.enum(["Selesai", "Proses", "Gagal"]),
  penanganan: z.string(),
  kronologi: z.string().optional(),
});

interface FormData {
  judul: string;
  lokasi: string;
  tanggalWaktu: string;
  status: Status;
  penanganan: string;
  kronologi: string;
}

const defaultForm: FormData = {
  judul: "",
  lokasi: "",
  tanggalWaktu: new Date().toISOString(),
  status: "Proses",
  penanganan: "",
  kronologi: "",
};

const laporanPublikState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(laporanPublikState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        laporanPublikState.create.loading = true;
        
        // Ensure we have a valid date
        if (!laporanPublikState.create.form.tanggalWaktu) {
          return toast.error("Tanggal laporan harus diisi");
        }
        
        // Format the data before sending
        const formData = {
          ...laporanPublikState.create.form,
          // Ensure the date is in the correct format for the API
          tanggalWaktu: new Date(laporanPublikState.create.form.tanggalWaktu).toISOString()
        };
        
        console.log("Sending form data:", formData); // Debug log
        
        const res = await ApiFetch.api.keamanan.laporanpublik["create"].post(
          formData
        );
        
        if (res.error) {
          console.error("API Error:", res.error);
          throw new Error("Failed to create laporan publik");
        }
        
        if (res.status === 200) {
          laporanPublikState.findMany.load();
          return toast.success("success create");
        }
        
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.error("Error creating laporan publik:", error);
        toast.error(error instanceof Error ? error.message : "Gagal membuat laporan publik");
        throw error; // Re-throw to be handled by the caller
      } finally {
        laporanPublikState.create.loading = false;
      }
    },
    resetForm() {
      laporanPublikState.create.form = { ...defaultForm };
    },
  },
  findMany: {
    data: null as
      | Prisma.LaporanPublikGetPayload<{
          include: { penanganan: true };
        }>[]
      | null,
      page: 1,
      totalPages: 1,
      loading: false,
      search: "",
     load: async (page = 1, limit = 10, search = "") => {
        laporanPublikState.findMany.loading = true; // ✅ Akses langsung via nama path
        laporanPublikState.findMany.page = page;
        laporanPublikState.findMany.search = search;
    
        try {
          const query: any = { page, limit };
          if (search) query.search = search;
      
          const res = await ApiFetch.api.keamanan.laporanpublik["find-many"].get({ query });
      
          if (res.status === 200 && res.data?.success) {
            laporanPublikState.findMany.data = res.data.data ?? [];
            laporanPublikState.findMany.totalPages = res.data.totalPages ?? 1;
          } else {
            laporanPublikState.findMany.data = [];
            laporanPublikState.findMany.totalPages = 1;
          }
        } catch (err) {
          console.error("Gagal fetch laporan publik paginated:", err);
          laporanPublikState.findMany.data = [];
          laporanPublikState.findMany.totalPages = 1;
        } finally {
          laporanPublikState.findMany.loading = false;
        }
      },
    },
  findUnique: {
    data: null as Prisma.LaporanPublikGetPayload<{
      include: { penanganan: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/keamanan/laporanpublik/${id}`);
        if (res.ok) {
          const data = await res.json();
          laporanPublikState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          laporanPublikState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        laporanPublikState.findUnique.data = null;
      }
    },
    resetForm() {
      laporanPublikState.findUnique.data = null;
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        laporanPublikState.delete.loading = true;
        const response = await fetch(`/api/keamanan/laporanpublik/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(
            result.message || "Laporan publik berhasil dihapus"
          );
          await laporanPublikState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus laporan publik");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus laporan publik");
      } finally {
        laporanPublikState.delete.loading = false;
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
        const response = await fetch(`/api/keamanan/laporanpublik/${id}`, {
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
                 judul: data.judul,
                 lokasi: data.lokasi,
                 tanggalWaktu: data.tanggalWaktu,
                 status: data.status,
                 penanganan: data.penanganan,
                 kronologi: data.kronologi,
               };
               return data; // Return the loaded data
             } else {
               throw new Error(result?.message || "Gagal memuat data");
             }
           } catch (error) {
             console.error("Error loading keamanan lingkungan:", error);
             toast.error(
               error instanceof Error ? error.message : "Gagal memuat data"
             );
             return null;
           }
         },
     
         async update() {
           const cek = templateForm.safeParse(laporanPublikState.edit.form);
           if (!cek.success) {
             const err = `[${cek.error.issues
               .map((v) => `${v.path.join(".")}`)
               .join("\n")}] required`;
             toast.error(err);
             return false;
           }
     
           try {
             laporanPublikState.edit.loading = true;
     
             const response = await fetch(
               `/api/keamanan/laporanpublik/${this.id}`,
               {
                 method: "PUT",
                 headers: {
                   "Content-Type": "application/json",
                 },
                 body: JSON.stringify({
                   judul: this.form.judul,
                   lokasi: this.form.lokasi,
                   tanggalWaktu: this.form.tanggalWaktu,
                   status: this.form.status,
                   penanganan: this.form.penanganan,
                   kronologi: this.form.kronologi,
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
               toast.success("Berhasil update laporan publik");
               await laporanPublikState.findMany.load(); // refresh list
               return true;
             } else {
               throw new Error(result.message || "Gagal update laporan publik");
             }
           } catch (error) {
             console.error("Error updating laporan publik:", error);
             toast.error(
               error instanceof Error
                 ? error.message
                 : "Terjadi kesalahan saat update laporan publik"
             );
             return false;
           } finally {
             laporanPublikState.edit.loading = false;
           }
         },
         reset() {
           laporanPublikState.edit.id = "";
           laporanPublikState.edit.form = { ...defaultForm };
         },
  }
});
export default laporanPublikState;
