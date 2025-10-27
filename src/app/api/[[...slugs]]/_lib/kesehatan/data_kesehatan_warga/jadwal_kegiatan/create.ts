import prisma from "@/lib/prisma";
import { Context } from "elysia";

type JadwalKegiatanInput = {
    content: string;
    informasiJadwalKegiatan: { name: string; tanggal: string; waktu: string; lokasi: string };
    deskripsiJadwalKegiatan: { deskripsi: string };
    layananJadwalKegiatan: { content: string };
    syaratKetentuanJadwalKegiatan: { content: string };
    dokumenJadwalKegiatan: { content: string };
}

const jadwalKegiatanCreate = async (context: Context) => {
    const body = await context.body as JadwalKegiatanInput;

    const {
        content,
        informasiJadwalKegiatan,
        deskripsiJadwalKegiatan,
        layananJadwalKegiatan,
        syaratKetentuanJadwalKegiatan,
        dokumenJadwalKegiatan,
    } = body;

    const [createdInformasiJadwalKegiatan, createdDeskripsiJadwalKegiatan, createdLayananJadwalKegiatan, createdSyaratKetentuanJadwalKegiatan, createdDokumenJadwalKegiatan] = await Promise.all([
        prisma.informasiJadwalKegiatan.create({ data: informasiJadwalKegiatan }),
        prisma.deskripsiJadwalKegiatan.create({ data: deskripsiJadwalKegiatan }),
        prisma.layananJadwalKegiatan.create({ data: layananJadwalKegiatan }),
        prisma.syaratKetentuanJadwalKegiatan.create({ data: syaratKetentuanJadwalKegiatan }),
        prisma.dokumenJadwalKegiatan.create({ data: dokumenJadwalKegiatan }),
    ])

    const jadwalKegiatan = await prisma.jadwalKegiatan.create({
        data: {
            content,
            informasiJadwalKegiatanId: createdInformasiJadwalKegiatan.id,
            deskripsiJadwalKegiatanId: createdDeskripsiJadwalKegiatan.id,
            layananJadwalKegiatanId: createdLayananJadwalKegiatan.id,
            syaratKetentuanJadwalKegiatanId: createdSyaratKetentuanJadwalKegiatan.id,
            dokumenJadwalKegiatanId: createdDokumenJadwalKegiatan.id,
        },
        include: {
            informasijadwalkegiatan: true,
            deskripsijadwalkegiatan: true,
            layananjadwalkegiatan: true,
            syaratketentuanjadwalkegiatan: true,
            dokumenjadwalkegiatan: true,
        }
    })
    return {
        success: true,
        message: "Success create jadwal kegiatan",
        data: jadwalKegiatan
    }
}
export default jadwalKegiatanCreate;