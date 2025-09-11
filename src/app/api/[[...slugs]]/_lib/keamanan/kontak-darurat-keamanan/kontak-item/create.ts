import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  nomorTelepon: string;
  imageId?: string;
};
export default async function kontakItemCreate(context: Context){
    const body = context.body as FormCreate

    await prisma.kontakItem.create({
        data: {
            nama: body.nama,
            nomorTelepon: body.nomorTelepon,
            imageId: body.imageId,
        },
    })
    return {
        success: true,
        message: "Success create kontak item",
        data: {
            ...body,
        },
    }
}