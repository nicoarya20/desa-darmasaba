import Elysia, { t } from "elysia";
import desaAntiKorupsiDelete from "./del";
import desaAntiKorupsiFindMany from "./findMany";
import desaAntiKorupsiFindUnique from "./findUnique";
import desaAntiKorupsiUpdate from "./updt";
import desaAntiKorupsiCreate from "./create";

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
      fileId: t.String(),
      kategoriId: t.String(),
    }),
  })

  // ✅ Update
  .put("/:id", desaAntiKorupsiUpdate, {
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        fileId: t.String(),
        kategoriId: t.String(),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", desaAntiKorupsiDelete);

export default DesaAntiKorupsi;
