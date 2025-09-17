import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  nomorTelepon: string;
  icon: string;
};
export default async function kontakItemCreate(context: Context){
    const body = context.body as FormCreate

    await prisma.kontakItem.create({
        data: {
            nama: body.nama,
            nomorTelepon: body.nomorTelepon,
            icon: body.icon,
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