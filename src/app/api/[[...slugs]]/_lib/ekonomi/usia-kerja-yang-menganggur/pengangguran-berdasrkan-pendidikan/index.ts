import Elysia, { t } from "elysia";
import grafikMenganggurBerdasarkanPendidikanCreate from "./create";
import grafikMenganggurBerdasarkanPendidikanDelete from "./del";
import grafikMenganggurBerdasarkanPendidikanFindMany from "./findMany";
import grafikMenganggurBerdasarkanPendidikanFindUnique from "./findUnique";
import grafikMenganggurBerdasarkanPendidikanUpdate from "./updt";

const GrafikMenganggurBerdasarkanPendidikan = new Elysia({prefix: "grafikmenganggurberdasarkanpendidikan", tags: ["Ekonomi/Usia Kerja Yang Menganggur/Pengangguran Berdasarkan Pendidikan"]})
.get("/find-many", grafikMenganggurBerdasarkanPendidikanFindMany)
.get("/:id", async (context) => {
    const response = await grafikMenganggurBerdasarkanPendidikanFindUnique(new Request(context.request))
    return response
  })
.put("/:id", grafikMenganggurBerdasarkanPendidikanUpdate, {
  params: t.Object({
    id: t.String(),
  }),
  body: t.Object({
    SD: t.String(),
    SMP: t.String(),
    SMA: t.String(),
    D3: t.String(),
    S1: t.String(),
  }),
})
.post("/create", grafikMenganggurBerdasarkanPendidikanCreate, {
  body: t.Object({
    SD: t.String(),
    SMP: t.String(),
    SMA: t.String(),
    D3: t.String(),
    S1: t.String(),
  }),
})
.delete("/del/:id", grafikMenganggurBerdasarkanPendidikanDelete, {
  params: t.Object({
    id: t.String(),
  }),
});


export default GrafikMenganggurBerdasarkanPendidikan