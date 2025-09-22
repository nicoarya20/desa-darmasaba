import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    id: string;
    name: string;
    tanggal: string;
    namaOrangtua: string;
    nomor: string;
    alamat: string;
    catatan: string;
}
export default async function mitraKolaborasiUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as Omit<FormUpdate, "id">;
    
        const {
            tanggal,
            namaOrangtua,
            nomor,
            alamat,
            catatan
        } = body;
    
        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "ID tidak ditemukan",
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
    
        const existing = await prisma.pendaftaranJadwalKegiatan.findUnique({
            where: {id},
        })
    
        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Pendaftaran jadwal kegiatan tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
    
        const updated = await prisma.pendaftaranJadwalKegiatan.update({
            where: { id },
            data: {
                tanggal,
                namaOrangtua,
                nomor,
                alamat,
                catatan,
            }
        })
    
        return new Response(JSON.stringify({
            success: true,
            message: "Pendaftaran jadwal kegiatan berhasil diupdate",
            data: updated,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error("Error updating pendaftaran jadwal kegiatan:", error); 
        return new Response(JSON.stringify({
            success: false,
            message: "Terjadi kesalahan saat mengupdate pendaftaran jadwal kegiatan",
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
    }