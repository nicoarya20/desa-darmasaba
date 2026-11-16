import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles from "../../../fileStorage/_lib/removeReleasedFiles";
import { BANK_SAMPAH_FILE_OWNER } from "./bank-sampah.data";

/** DELETE (admin): hapus bank sampah; pengurus & foto kegiatan ikut terhapus (cascade) beserta berkasnya. */
const keteranganBankSampahTerdekatDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const keteranganBankSampahTerdekat = await prisma.keteranganBankSampahTerdekat.findUnique({
        where: { id },
        // Berkas milik bank sampah (bagan, foto pengurus, foto kegiatan) dibersihkan setelah baris terhapus.
        select: {
            fotoBaganStrukturId: true,
            pengurus: { select: { imageId: true } },
            fotoKegiatan: { select: { imageId: true } },
        },
    });

    if (!keteranganBankSampahTerdekat) {
        return {
            status: 404,
            body: "Keterangan bank sampah terdekat tidak ditemukan",
        };
    }

    await prisma.keteranganBankSampahTerdekat.delete({
        where: { id },
    });
    const { fotoBaganStrukturId, pengurus, fotoKegiatan } = keteranganBankSampahTerdekat;
    await removeReleasedFiles(BANK_SAMPAH_FILE_OWNER, [
        fotoBaganStrukturId,
        ...pengurus.map((p) => p.imageId),
        ...fotoKegiatan.map((f) => f.imageId),
    ]);

    return {
        success: true,
        status: 200,
        message: "Keterangan bank sampah terdekat berhasil dihapus",
    };
};

export default keteranganBankSampahTerdekatDelete;