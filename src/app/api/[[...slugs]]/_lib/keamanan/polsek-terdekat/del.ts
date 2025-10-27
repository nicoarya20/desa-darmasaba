import prisma from "@/lib/prisma";
import { Context } from "elysia";

const polsekTerdekatDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const polsekTerdekat = await prisma.polsekTerdekat.findUnique({
        where: { id },
        include: {
            layananPolsek: true,
        }
    });

    if (!polsekTerdekat) {
        return {
            status: 404,
            body: "Polsek terdekat tidak ditemukan",
        };
    }

    await prisma.polsekTerdekat.delete({
        where: { id },
    });

    return {
        success: true,
        status: 200,
        message: "Polsek terdekat berhasil dihapus",
    };
};

export default polsekTerdekatDelete;