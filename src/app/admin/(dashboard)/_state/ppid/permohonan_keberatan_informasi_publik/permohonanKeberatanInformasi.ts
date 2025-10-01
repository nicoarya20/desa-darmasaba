import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().min(3, "Email minimal 3 karakter"),
    notelp: z.string().min(3, "Nomor Telepon minimal 3 karakter"),
    alasan: z.string().min(3, "Alasan minimal 3 karakter"),
})

type PermohonanKeberatanInformasiForm = Prisma.FormulirPermohonanKeberatanGetPayload<{
    select: {
        name: true;
        email: true;
        notelp: true;
        alasan: true;
    };
}>;

const permohonanKeberatanInformasi = proxy({
    create: {
        form: {} as PermohonanKeberatanInformasiForm,
        loading: false,
        async create(){
            const cek = templateForm.safeParse(permohonanKeberatanInformasi.create.form);
            if(!cek.success) {
                const err = `[${cek.error.issues
                    .map((v) => `${v.path.join(".")}`)
                    .join("\n")}] required`;
                return toast.error(err);
            }
            try {
                permohonanKeberatanInformasi.create.loading = true;
                const res = await ApiFetch.api.ppid.permohonankeberataninformasipublik["create"].post(permohonanKeberatanInformasi.create.form);
                if (res.status === 200) {
                    permohonanKeberatanInformasi.findMany.load();
                    return toast.success("success create");
                }
                return toast.error("failed create");
            } catch (error) {
                console.log((error as Error).message);
            } finally {
                permohonanKeberatanInformasi.create.loading = false;
            }
        },
    },
    findMany: {
        data: null as
        | Prisma.FormulirPermohonanKeberatanGetPayload<{omit: {isActive: true}}>[]
        | null,
        async load() {
            const res = await ApiFetch.api.ppid.permohonankeberataninformasipublik["find-many"].get();
            if (res.status === 200) {
                permohonanKeberatanInformasi.findMany.data = res.data?.data ?? [];
            }
        }
    },
    findUnique: {
        data: null as Prisma.FormulirPermohonanKeberatanGetPayload<{
          omit: {
            isActive: true;
          };
        }> | null,
        async load(id: string) {
          try {
            const res = await fetch(`/api/ppid/permohonankeberataninformasipublik/${id}`);
            if (res.ok) {
              const data = await res.json();
              permohonanKeberatanInformasi.findUnique.data = data.data ?? null;
            } else {
              console.error("Failed to fetch permohonan keberatan informasi:", res.statusText);
              permohonanKeberatanInformasi.findUnique.data = null;
            }
          } catch (error) {
            console.error("Error fetching permohonan keberatan informasi:", error);
            permohonanKeberatanInformasi.findUnique.data = null;
          }
        },
      }
});

export default permohonanKeberatanInformasi;

