// src/app/api/[[...slugs]]/_lib/landing_page/apbdes/index.ts
import Elysia, { t } from "elysia";
import apbdesCreate from "./create";
import apbdesDelete from "./del";
import apbdesFindMany from "./findMany";
import apbdesFindUnique from "./findUnique";
import apbdesUpdate from "./updt";
import realisasiCreate from "./realisasi/create";
import realisasiUpdate from "./realisasi/update";
import realisasiDelete from "./realisasi/delete";

// Definisikan skema untuk item APBDes (tanpa realisasi field)
const ApbdesItemSchema = t.Object({
  // id item lama; dikirim saat edit agar realisasi tetap ter-link walau kode
  // diubah. Optional & backward-compatible: create/klien lama tak mengirimnya.
  id: t.Optional(t.String()),
  kode: t.String(),
  uraian: t.String(),
  anggaran: t.Number(),
  level: t.Number(),
  tipe: t.Optional(t.Union([t.String(), t.Null()])), // "pendapatan" | "belanja" | "pembiayaan" | null
});

const APBDes = new Elysia({
  prefix: "/apbdes",
  tags: ["Landing Page/Profile/APB Des"],
})

  // ✅ Find all (dengan query opsional: page, limit, tahun)
  .get("/findMany", apbdesFindMany)

  // ✅ Find by ID (include realisasiItems)
  .get("/:id", apbdesFindUnique)

  // ✅ Create APBDes dengan items (tanpa realisasi)
  .post("/create", apbdesCreate, {
    body: t.Object({
      tahun: t.Number(),
      name: t.Optional(t.String()),
      deskripsi: t.Optional(t.String()),
      jumlah: t.Optional(t.String()),
      imageId: t.Optional(t.String()),
      fileId: t.Optional(t.String()),
      items: t.Array(ApbdesItemSchema),
    }),
  })

  // ✅ Update APBDes dengan items (tanpa realisasi)
  .put("/:id", apbdesUpdate, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      tahun: t.Number(),
      name: t.Optional(t.String()),
      deskripsi: t.Optional(t.String()),
      jumlah: t.Optional(t.String()),
      imageId: t.Optional(t.String()),
      fileId: t.Optional(t.String()),
      items: t.Array(ApbdesItemSchema),
    }),
  })

  // ✅ Delete APBDes
  .delete("/del/:id", apbdesDelete, {
    params: t.Object({ id: t.String() }),
  })

  // =========================================
  // REALISASI ENDPOINTS
  // =========================================
  
  // ✅ Create realisasi untuk item tertentu
  .post("/:itemId/realisasi", realisasiCreate, {
    params: t.Object({ itemId: t.String() }),
    body: t.Object({
      kode: t.String(),
      jumlah: t.Number(),
      tanggal: t.String(),
      keterangan: t.Optional(t.String()),
      buktiFileId: t.Optional(t.String()),
    }),
  })

  // ✅ Update realisasi
  .put("/realisasi/:realisasiId", realisasiUpdate, {
    params: t.Object({ realisasiId: t.String() }),
    body: t.Object({
      kode: t.Optional(t.String()),
      jumlah: t.Optional(t.Number()),
      tanggal: t.Optional(t.String()),
      keterangan: t.Optional(t.String()),
      buktiFileId: t.Optional(t.String()),
    }),
  })

  // ✅ Delete realisasi
  .delete("/realisasi/:realisasiId", realisasiDelete, {
    params: t.Object({ realisasiId: t.String() }),
  });

export default APBDes;