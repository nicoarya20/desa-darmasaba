import Elysia, { t } from "elysia";
import kategoriDesaAntiKorupsiCreate from "./create";
import kategoriDesaAntiKorupsiDelete from "./del";
import kategoriDesaAntiKorupsiFindMany from "./findMany";
import kategoriDesaAntiKorupsiFindUnique from "./findUnique";
import kategoriDesaAntiKorupsiUpdate from "./updt";

const KategoriDesaAntiKorupsi = new Elysia({
  prefix: "/kategoridak",
  tags: ["Landing Page/Desa Anti Korupsi"],
})
  .get("/findMany", kategoriDesaAntiKorupsiFindMany)
  .get("/:id", async (context) => {
    const response = await kategoriDesaAntiKorupsiFindUnique(context);
    return response;
  })
  .delete("/del/:id", kategoriDesaAntiKorupsiDelete)
  .post("/create", kategoriDesaAntiKorupsiCreate, {
    body: t.Object({
      name: t.String(),
    }),
  })
  .put("/:id", kategoriDesaAntiKorupsiUpdate, {
    body: t.Object({
      name: t.String(),
    }),
  });

export default KategoriDesaAntiKorupsi;
