import type { Context } from "elysia";
import prisma from "@/lib/prisma";
import { parseSalinInput, planSalin } from "@/lib/desa-anti-korupsi-salin";
import { guardAdmin } from "./admin-guard";

/**
 * Admin: salin dokumen aktif ke program lain (langsung tersimpan, bukan draft) dalam satu transaksi.
 * Berkas yang sudah ada di folder tujuan dilewati; respons `{ copied, skipped }`.
 */
export default async function desaAntiKorupsiSalinKeProgram(context: Context) {
  const denied = await guardAdmin(context.set);
  if (denied) return denied;

  const parsed = parseSalinInput(context.body);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false as const, message: parsed.message };
  }
  const input = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const program = await tx.desaAntiKorupsi.findUnique({ where: { id: input.targetProgramId }, select: { id: true } });
    if (!program) return { status: 400, message: "Program tujuan tidak ditemukan" } as const;
    if (input.targetFolderId !== null) {
      const folder = await tx.folderDokumenDesaAntiKorupsi.findFirst({
        where: { id: input.targetFolderId, desaAntiKorupsiId: input.targetProgramId, isActive: true },
        select: { id: true },
      });
      if (!folder) return { status: 400, message: "Folder tujuan tidak ditemukan pada program tujuan" } as const;
    }

    const sumber = await tx.dokumenDesaAntiKorupsi.findMany({
      where: { id: { in: input.dokumenIds }, isActive: true },
      select: { id: true, desaAntiKorupsiId: true, fileId: true, judul: true },
    });
    const aktifTarget = await tx.dokumenDesaAntiKorupsi.findMany({
      where: { desaAntiKorupsiId: input.targetProgramId, isActive: true },
      select: { folderId: true, fileId: true, urutan: true },
    });
    const plan = planSalin(input, sumber, aktifTarget);
    if (!plan.ok) return { status: plan.status, message: plan.message } as const;

    if (plan.create.length > 0) {
      await tx.dokumenDesaAntiKorupsi.createMany({
        data: plan.create.map((d) => ({
          ...d,
          desaAntiKorupsiId: input.targetProgramId,
          folderId: input.targetFolderId,
        })),
      });
    }
    return { status: 200, data: { copied: plan.create.length, skipped: plan.skipped } } as const;
  });

  if ("message" in result) {
    context.set.status = result.status;
    return { success: false as const, message: result.message };
  }
  return { success: true as const, data: result.data };
}
