import { t } from "elysia";

/**
 * Field opsional `sopFileId` (PDF SOP di FileStorage) untuk body create/update pelayanan Surat Keterangan &
 * Telunjuk Sakti Desa. Hilang = tidak diubah, null/"" = hapus tautan, string = id FileStorage (dicek `parseSopFileId`).
 */
export const sopFileBodySchema = {
    sopFileId: t.Optional(t.Union([t.String(), t.Null()])),
};
