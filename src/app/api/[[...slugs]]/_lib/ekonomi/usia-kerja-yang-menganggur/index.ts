import Elysia, { t } from "elysia";
import grafikMenganggurBerdasarkanUsiaFindMany from "./findMany";
import grafikMenganggurBerdasarkanUsiaFindUnique from "./findUnique";
import grafikMenganggurBerdasarkanUsiaUpdate from "./updt";
import grafikMenganggurBerdasarkanUsiaCreate from "./create";
import grafikMenganggurBerdasarkanUsiaDelete from "./del";

const GrafikUsiaKerjaYangMenganggur = new Elysia({prefix: "/grafikusiakerjayangmenganggur", tags: ["Ekonomi/Jumlah Penduduk Usia Kerja Yang Menganggur"]})
.get("/find-many", grafikMenganggurBerdasarkanUsiaFindMany)
.get("/:id", async (context) => {
    const response = await grafikMenganggurBerdasarkanUsiaFindUnique(context.request)
    return response
  })
.put("/:id", grafikMenganggurBerdasarkanUsiaUpdate, {
  params: t.Object({
    id: t.String(),
  }),
  body: t.Object({
    usia18_25: t.String(),
    usia26_35: t.String(),
    usia36_45: t.String(),
    usia46_keatas: t.String(),
  }),
})
.post("/create", grafikMenganggurBerdasarkanUsiaCreate, {
  body: t.Object({
    usia18_25: t.String(),
    usia26_35: t.String(),
    usia36_45: t.String(),
    usia46_keatas: t.String(),
  }),
})
.delete("/del/:id", grafikMenganggurBerdasarkanUsiaDelete, {
  params: t.Object({
    id: t.String(),
  }),
});

export default GrafikUsiaKerjaYangMenganggur;
