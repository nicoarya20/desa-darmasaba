import prisma from "@/lib/prisma";
import { Context } from "elysia";

type JadwalKegiatanInput = {
    content: string;
    informasiJadwalKegiatan: { name: string; tanggal: string; waktu: string; lokasi: string };
    deskripsiJadwalKegiatan: { deskripsi: string };
    layananJadwalKegiatan: { content: string };
    syaratKetentuanJadwalKegiatan: { content: string };
    dokumenJadwalKegiatan: { content: string };
    pendaftaranJadwalKegiatan: { name: string, tanggal: string, namaOrangtua: string, nomor: string, alamat: string, catatan: string };
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
        pendaftaranJadwalKegiatan,
    } = body;

    const [createdInformasiJadwalKegiatan, createdDeskripsiJadwalKegiatan, createdLayananJadwalKegiatan, createdSyaratKetentuanJadwalKegiatan, createdDokumenJadwalKegiatan, createdPendaftaranJadwalKegiatan] = await Promise.all([
        prisma.informasiJadwalKegiatan.create({ data: informasiJadwalKegiatan }),
        prisma.deskripsiJadwalKegiatan.create({ data: deskripsiJadwalKegiatan }),
        prisma.layananJadwalKegiatan.create({ data: layananJadwalKegiatan }),
        prisma.syaratKetentuanJadwalKegiatan.create({ data: syaratKetentuanJadwalKegiatan }),
        prisma.dokumenJadwalKegiatan.create({ data: dokumenJadwalKegiatan }),
        prisma.pendaftaranJadwalKegiatan.create({ data: pendaftaranJadwalKegiatan }),
    ])

    const jadwalKegiatan = await prisma.jadwalKegiatan.create({
        data: {
            content,
            informasiJadwalKegiatanId: createdInformasiJadwalKegiatan.id,
            deskripsiJadwalKegiatanId: createdDeskripsiJadwalKegiatan.id,
            layananJadwalKegiatanId: createdLayananJadwalKegiatan.id,
            syaratKetentuanJadwalKegiatanId: createdSyaratKetentuanJadwalKegiatan.id,
            dokumenJadwalKegiatanId: createdDokumenJadwalKegiatan.id,
            pendaftaranJadwalKegiatanId: createdPendaftaranJadwalKegiatan.id,
        },
        include: {
            informasijadwalkegiatan: true,
            deskripsijadwalkegiatan: true,
            layananjadwalkegiatan: true,
            syaratketentuanjadwalkegiatan: true,
            dokumenjadwalkegiatan: true,
            pendaftaranjadwalkegiatan: true,
        }
    })
    return {
        success: true,
        message: "Success create jadwal kegiatan",
        data: jadwalKegiatan
    }
}
export default jadwalKegiatanCreate;