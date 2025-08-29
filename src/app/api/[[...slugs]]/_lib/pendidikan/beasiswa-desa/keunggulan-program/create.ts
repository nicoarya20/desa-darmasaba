import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    judul: string;
    deskripsi: string;
}

export default async function keunggulanProgramCreate(context: Context) {
    const body = context.body as FormCreate;

    try {
        const result = await prisma.keunggulanProgram.create({
            data: {
                judul: body.judul,
                deskripsi: body.deskripsi,
            },
        });

        return {
            success: true,
            message: "Berhasil membuat data keunggulan program",
            data: result,
        };
    } catch (error) {
        console.error("Gagal membuat data keunggulan program:", error);
        throw new Error("Gagal membuat data keunggulan program: " + (error as Error).message);
    }

}
    