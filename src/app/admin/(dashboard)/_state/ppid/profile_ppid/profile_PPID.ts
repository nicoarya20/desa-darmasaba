import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    biodata: z.string().min(3, "Biodata minimal 3 karakter"),
    riwayat: z.string().min(3, "Riwayat minimal 3 karakter"),
    pengalaman: z.string().min(3, "Pengalaman minimal 3 karakter"),
    unggulan: z.string().min(3, "Unggulan minimal 3 karakter"),
})

type ProfilePPIDForm = Prisma.ProfilePPIDGetPayload<{
    select: {
        name: true;
        biodata: true;
        riwayat: true;
        pengalaman: true;
        unggulan: true;
    }
}>

const profilePPID = proxy({
    create: {
        form: {} as ProfilePPIDForm,
        loading: false,
        async create() {
            const cek = templateForm.safeParse(profilePPID.create.form);
            if (!cek.success) {
                const err = `[${cek.error.issues
                .map((v) => `${v.path.join(".")}`)
                .join("\n")}] required`;
                return toast.error(err);
            }
            try {
                profilePPID.create.loading = true;
                const res = await ApiFetch.api.ppid.profileppid["create"].post(profilePPID.create.form);
                if (res.status === 200) {
                    profilePPID.findMany.load();
                    return toast.success("success create");
                }
                return toast.error("failed create");
            } catch (error) {
                console.log((error as Error).message);
            } finally {
                profilePPID.create.loading = false;
            }
        }
    },
    findMany: {
        data: null as
        | Prisma.ProfilePPIDGetPayload<{omit: {isActive: true}}>[]
        | null,
        async load() {
            const res = await ApiFetch.api.ppid.profileppid["find-many"].get();
            if (res.status === 200) {
                profilePPID.findMany.data = res.data?.data ?? [];
            }
        }
    }
})   

const stateProfilePPID = proxy({
    profilePPID
})

export default stateProfilePPID;