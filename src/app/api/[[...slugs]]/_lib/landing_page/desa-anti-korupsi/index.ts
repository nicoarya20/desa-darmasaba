import Elysia, { t } from "elysia";
import desaAntiKorupsiDelete from "./del";
import desaAntiKorupsiFindMany from "./findMany";
import desaAntiKorupsiFindUnique from "./findUnique";
import desaAntiKorupsiUpdate from "./updt";
import desaAntiKorupsiCreate from "./create";
import desaAntiKorupsiSalinKeProgram from "./salin";
import {
  desaAntiKorupsiSampahHapus,
  desaAntiKorupsiSampahList,
  desaAntiKorupsiSampahPulihkan,
} from "./sampah";
import desaAntiKorupsiZip from "./zip";
import { dokumenBody, foldersBody } from "@/lib/dokumen-folder-body";

// Skema folder/dokumen dipakai bersama APBDes; aturan detailnya divalidasi planProgramSync (400 + pesan).
const DesaAntiKorupsi = new Elysia({
  prefix: "/desaantikorupsi",
  tags: ["Landing Page/Desa Anti Korupsi"],
})

  // ✅ Find all
  .get("/findMany", desaAntiKorupsiFindMany)

  // ✅ Find by ID
  .get("/:id", desaAntiKorupsiFindUnique)

  // ✅ Tempat sampah dokumen (khusus admin; guard di handler, retensi DAK_SAMPAH_RETENSI_HARI)
  .get("/:id/sampah", desaAntiKorupsiSampahList)
  .post("/sampah/:dokumenId/pulihkan", desaAntiKorupsiSampahPulihkan)
  .delete("/sampah/:dokumenId", desaAntiKorupsiSampahHapus)

  // ✅ Salin dokumen ke program lain (khusus admin; langsung tersimpan). Aturan 1..50 id, kepemilikan
  // folder & batas dokumen dicek di handler supaya respons 400/409 + pesan.
  .post("/dokumen/salin-ke-program", desaAntiKorupsiSalinKeProgram, {
    body: t.Object({
      dokumenIds: t.Array(t.String()),
      targetProgramId: t.String(),
      targetFolderId: t.Nullable(t.String()),
    }),
  })

  // ✅ Unduh ZIP dokumen aktif (publik); ?folder=<id|umum> = satu folder saja
  .get("/:id/zip", desaAntiKorupsiZip, {
    query: t.Object({ folder: t.Optional(t.String()) }),
  })

  // ✅ Create
  .post("/create", desaAntiKorupsiCreate, {
    body: t.Object({
      name: t.String(),
      deskripsi: t.String(),
      kategoriId: t.String(),
      folders: t.Optional(foldersBody),
      dokumen: t.Optional(dokumenBody),
    }),
  })

  // ✅ Update
  .put("/:id", desaAntiKorupsiUpdate, {
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        kategoriId: t.String(),
        // tidak dikirim = dipertahankan; array = set final (folder hilang → dokumennya ke "Umum")
        folders: t.Optional(foldersBody),
        dokumen: t.Optional(dokumenBody),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", desaAntiKorupsiDelete);

export default DesaAntiKorupsi;
