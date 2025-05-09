import prisma from "@/lib/prisma";
import { Context } from "elysia";

export async function misiPPIDDelete(context: Context) {
    const id = context.params.id

    await prisma.misiPPID.delete({
        where: {
            id: id
        }
    })

    return {
        success: true,
        message: "Misi PPID Berhasil Dihapus",
    }
}