import Elysia, { t } from "elysia";
import kontakDaruratCreate from "./create";
import kontakDaruratFindMany from "./find-many";
import kontakDaruratDelete from "./del";
import kontakDaruratUpdate from "./updt";
import kontakDaruratFindUnique from "./findUnique";

const KontakDarurat = new Elysia({
    prefix: "/kontakdarurat",
    tags: ["Kesehatan/Kontak Darurat"]
})
.post("/create", kontakDaruratCreate, {
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
        whatsapp: t.String(),
    })
})
.get("/find-many", kontakDaruratFindMany)
.delete("/del/:id", kontakDaruratDelete)
.get("/:id", async (context) => {
    const response = await kontakDaruratFindUnique(new Request(context.request));
    return response;
})
.put(
    "/:id",
    async (context) => {
        const response = await kontakDaruratUpdate(context);
        return response;
    },
    {
        body: t.Object({
            name: t.String(),
            deskripsi: t.String(),
            imageId: t.String(),
            whatsapp: t.String(),
        })
    }
)

export default KontakDarurat;
