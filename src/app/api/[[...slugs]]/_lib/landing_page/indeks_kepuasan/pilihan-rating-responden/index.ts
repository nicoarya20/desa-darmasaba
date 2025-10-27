import Elysia, { t } from "elysia";
import pilihanRatingRespondenCreate from "./create";
import pilihanRatingRespondenDelete from "./del";
import pilihanRatingRespondenFindMany from "./findMany";
import pilihanRatingRespondenFindUnique from "./findUnique";
import pilihanRatingRespondenUpdate from "./updt";

const PilihanRatingResponden = new Elysia({
    prefix: "/pilihanratingresponden",
    tags: ["PPID / Indeks Kepuasan / Pilihan Rating Responden"],
})

 .post("/create", pilihanRatingRespondenCreate, {
    body: t.Object({
      name: t.String(),
    }),
  })

  .get("/findMany", pilihanRatingRespondenFindMany)
  .get("/:id", async (context) => {
    const response = await pilihanRatingRespondenFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .put("/:id", pilihanRatingRespondenUpdate, {
    body: t.Object({
      name: t.String(),
    }),
  })
  .delete("/del/:id", pilihanRatingRespondenDelete);

export default PilihanRatingResponden;