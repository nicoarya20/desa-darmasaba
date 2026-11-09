import Elysia, { t } from "elysia";
import desaAntiKorupsiDelete from "./del";
import desaAntiKorupsiFindMany from "./findMany";
import desaAntiKorupsiFindUnique from "./findUnique";
import desaAntiKorupsiUpdate from "./updt";
import desaAntiKorupsiCreate from "./create";
import { DOKUMEN_MAX_PER_PROGRAM } from "@/lib/desa-anti-korupsi-dokumen";

// Tipe dasar saja; aturan dokumen (judul wajib, urutan, duplikat, id milik program)
// divalidasi di parseDokumenList/planDokumenSync supaya pesan error seragam.
const dokumenBody = t.Array(
  t.Object({
    id: t.Optional(t.String()),
    fileId: t.String(),
    judul: t.String(),
    urutan: t.Number(),
  }),
  { maxItems: DOKUMEN_MAX_PER_PROGRAM }
);

const DesaAntiKorupsi = new Elysia({
  prefix: "/desaantikorupsi",
  tags: ["Landing Page/Desa Anti Korupsi"],
})

  // ✅ Find all
  .get("/findMany", desaAntiKorupsiFindMany)

  // ✅ Find by ID
  .get("/:id", desaAntiKorupsiFindUnique)

  // ✅ Create
  .post("/create", desaAntiKorupsiCreate, {
    body: t.Object({
      name: t.String(),
      deskripsi: t.String(),
      kategoriId: t.String(),
      dokumen: t.Optional(dokumenBody),
    }),
  })

  // ✅ Update
  .put("/:id", desaAntiKorupsiUpdate, {
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        kategoriId: t.String(),
        // tidak dikirim = isi folder dipertahankan; array = set dokumen final
        dokumen: t.Optional(dokumenBody),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", desaAntiKorupsiDelete);

export default DesaAntiKorupsi;
