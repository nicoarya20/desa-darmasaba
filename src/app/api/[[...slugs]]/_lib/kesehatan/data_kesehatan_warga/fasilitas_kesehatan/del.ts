import prisma from "@/lib/prisma";
import { Context } from "elysia";

const fasilitasKesehatanDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            message: "ID tidak ditemukan",
        }
    }

    const fasilitasKesehatan = await prisma.fasilitasKesehatan.findUnique({
        where: { id },
        include: {
            informasiumum: true,
            layananunggulan: true,
            dokterdantenagamedis: true,
            fasilitaspendukung: true,
            prosedurpendaftaran: true,
            tarifdanlayanan: true,
        }
    })

    if (!fasilitasKesehatan) {
        return {
            status: 404,
            message: "Fasilitas kesehatan tidak ditemukan",
        }
    }

    await prisma.fasilitasKesehatan.delete({
        where: { id },
    })

    return {
        status: 200,
        success: true,
        message: "Fasilitas kesehatan berhasil dihapus",
    }
}
export default fasilitasKesehatanDelete