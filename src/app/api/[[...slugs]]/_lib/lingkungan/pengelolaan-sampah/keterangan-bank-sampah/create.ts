import prisma from "@/lib/prisma";
import { bankSampahBodySchema } from "@/lib/bank-sampah/bank-sampah.validation";
import { Context } from "elysia";
import { fail, validationFailure, writeFailure } from "../../../_struktur-organisasi/http";
import { dataBankSampah, inovasiValid, PESAN_INOVASI_TIDAK_VALID } from "./bank-sampah.data";

/** POST (admin): tambah bank sampah beserta detail opsional (deskripsi, kontak, medsos, bagan, inovasi). */
export default async function keteranganBankSampahTerdekatCreate(context: Context) {
  const parsed = bankSampahBodySchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);
  const body = parsed.data;
  if (!(await inovasiValid(body.programInovasiIds))) return fail(context, 400, PESAN_INOVASI_TIDAK_VALID);

  const inovasi = body.programInovasiIds?.length
    ? { programInovasi: { connect: body.programInovasiIds.map((id) => ({ id })) } }
    : {};
  try {
    const created = await prisma.keteranganBankSampahTerdekat.create({ data: { ...dataBankSampah(body), ...inovasi } });
    return {
      success: true,
      message: "Sukses menambahkan keterangan bank sampah terdekat",
      data: created,
    };
  } catch (error) {
    return writeFailure(error, context);
  }
}
