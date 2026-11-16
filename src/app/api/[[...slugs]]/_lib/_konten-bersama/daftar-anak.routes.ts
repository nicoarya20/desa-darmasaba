import { t } from "elysia";
import { strukturPlugin } from "../_struktur-organisasi/plugin";
import type { DaftarAnakHandlers } from "./daftar-anak.handlers";

const teksOpsional = t.Optional(t.Nullable(t.String()));
const indukParams = t.Object({ id: t.String() });
const itemParams = t.Object({ id: t.String(), itemId: t.String() });
const urutanBody = t.Object({ ids: t.Array(t.String()) });

// Body TypeBox hanya menjaga bentuk kasar; aturan isi (wajib, panjang, batas) ada di skema zod bersama.
const BODY = {
  galeri: {
    create: t.Object({ items: t.Array(t.Object({ imageId: t.String(), keterangan: teksOpsional })) }),
    update: t.Object({ keterangan: teksOpsional }),
  },
  pengurus: {
    create: t.Object({ items: t.Array(t.Object({ nama: t.String(), jabatan: t.String(), imageId: teksOpsional })) }),
    update: t.Object({ nama: t.Optional(t.String()), jabatan: t.Optional(t.String()), imageId: teksOpsional }),
  },
} as const;

export type JenisDaftarAnak = keyof typeof BODY;

/**
 * Rute Elysia daftar anak di bawah modul induk: `GET|POST /:id{path}`, `PUT /:id{path}/urutan`,
 * `PUT|DELETE /:id{path}/:itemId`. Error tak terduga → 500 seragam `{ success: false, message }`.
 */
export function createDaftarAnakRoutes<const Path extends string>(
  path: Path,
  jenis: JenisDaftarAnak,
  handlers: DaftarAnakHandlers,
  { tag, logTag }: { tag: string; logTag: string },
) {
  const body = BODY[jenis];
  return strukturPlugin("", tag, logTag)
    .get(`/:id${path}`, handlers.list, { params: indukParams })
    .post(`/:id${path}`, handlers.create, { params: indukParams, body: body.create })
    .put(`/:id${path}/urutan`, handlers.reorder, { params: indukParams, body: urutanBody })
    .put(`/:id${path}/:itemId`, handlers.update, { params: itemParams, body: body.update })
    .delete(`/:id${path}/:itemId`, handlers.remove, { params: itemParams });
}
