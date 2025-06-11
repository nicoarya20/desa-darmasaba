import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    imageId: z.string().min(1, "Gambar wajib dipilih"),
})

const defaultForm = {
    name: "",
    imageId: "",
};

type StrukturPPIDForm = Prisma.StrukturPPIDGetPayload<{
    select: {
        id: true;
        name: true;
        imageId: true;
        image?: {
            select: {
                link: true;
            };
        };
    };
}>;

const stateStrukturPPID = proxy({
    struktur: {
        data: null as StrukturPPIDForm | null,
        loading: false,
        error: null as string | null,

        async load(id: string) {
            if(!id) {
                toast.warn("ID tidak valid")
                return null
            }

            this.loading = true;
            this.error = null;

            try {
                const response = await fetch(`/api/ppid/strukturppid/${id}`);
                
                if(!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const result = await response.json();

                if(result.success) {
                    this.data = result.data;
                    return result.data
                } else {
                    throw new Error(result.message || "Gagal mengambil data struktur")
                }
            } catch (error) {
                const errorMessage = (error as Error).message;
                this.error = errorMessage;
                console.error("Load struktur error:", errorMessage);
                toast.error("Terjadi kesalahan saat mengambil data struktur");
                return null;
            } finally {
                this.loading = false;
            }
        },

        reset() {
            this.data = null;
            this.error = null;
            this.loading = false;
        }
    },

    editStruktur: {
        id: "",
        form: { ...defaultForm },
        loading: false,
        error: null as string | null,
        isReadOnly: false,

        initialize(strukturData: StrukturPPIDForm) {
            this.id = strukturData.id;
            this.isReadOnly = false;
            this.form = {
                name: strukturData.name || "",
                imageId: strukturData.imageId || "",
            };
        },

        updateField(field: keyof typeof defaultForm, value: string) {
            this.form[field] = value;
        },

        async submit() {
            const validation = templateForm.safeParse(this.form);

            if (!validation.success) {
                const errors = validation.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join(", ");
                toast.error(`Form tidak valid: ${errors}`);
                return false;
            }

            this.loading = true;
            this.error = null;
            
            try {
               const response = await fetch(`/api/ppid/strukturppid/${this.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(this.form),
               }) 

               if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
               }

               const result = await response.json();

               if (result.success) {
                toast.success("Berhasil update struktur");
                await stateStrukturPPID.struktur.load(this.id);
                return true;
               } else {
                throw new Error(result.message || "Gagal update struktur");
               }
            } catch (error) {
                const errorMessage = (error as Error).message;
                this.error = errorMessage;
                console.error("Update struktur error:", errorMessage);
                toast.error("Terjadi kesalahan saat update struktur");
                return false;
            } finally {
                this.loading = false;
            }
        },

        reset() {
            this.id = "";
            this.form = { ...defaultForm };
            this.error = null;
            this.loading = false;
            this.isReadOnly = false;
        }
    },

    async loadForEdit(id: string) {
        const strukturData = await this.struktur.load(id);
        if (strukturData) {
            this.editStruktur.initialize(strukturData);
        }
        return strukturData;
    },

    reset() {
        this.struktur.reset();
        this.editStruktur.reset();
    }
})

export default stateStrukturPPID;
    