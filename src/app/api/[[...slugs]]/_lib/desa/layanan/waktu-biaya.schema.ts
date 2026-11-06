import { t } from "elysia";

/**
 * Field opsional estimasiWaktu & biaya untuk body create/update pelayanan.
 * Tipe dibiarkan longgar (Number, bukan Integer) supaya aturan ketat + pesan
 * errornya ditangani parseWaktuBiaya di handler (HTTP 400 konsisten).
 */
export const waktuBiayaBodySchema = {
    estimasiWaktu: t.Optional(t.Union([t.String(), t.Null()])),
    biaya: t.Optional(t.Union([t.Number(), t.Null()])),
};
