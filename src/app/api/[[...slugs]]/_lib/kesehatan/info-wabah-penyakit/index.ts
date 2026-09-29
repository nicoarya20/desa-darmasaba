import Elysia, { t } from "elysia";
import infoWabahPenyakitCreate from "./create";
import infoWabahPenyakitFindMany from "./find-many";
import infoWabahPenyakitDelete from "./del";
import infoWabahPenyakitFindUnique from "./findUnique";
import infoWabahPenyakitUpdate from "./updt";

const InfoWabahPenyakit = new Elysia({
    prefix: "/infowabahpenyakit",
    tags: ["Kesehatan/Info Wabah Penyakit"]
})
.post("/create", infoWabahPenyakitCreate, {
    body: t.Object({
        name: t.String(),
        deskripsiSingkat: t.String(),
        deskripsiLengkap: t.String(),
        imageId: t.String(),
    })
})
.get("/find-many", infoWabahPenyakitFindMany)
.delete("/del/:id", infoWabahPenyakitDelete)
.get("/:id", async (context) => {
    const response = await infoWabahPenyakitFindUnique(context.request);
    return response;
})
.put("/:id", async (context) => {
    const response = await infoWabahPenyakitUpdate(context);
    return response;
},
{
    body: t.Object({
        name: t.String(),
        deskripsiSingkat: t.String(),
        deskripsiLengkap: t.String(),
        imageId: t.String(),
    })
}
)
export default InfoWabahPenyakit;

