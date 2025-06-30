import Elysia, { t } from "elysia";
import kontakDaruratKeamananFindMany from "./findMany";
import kontakDaruratKeamananFindUnique from "./findUnique";
import kontakDaruratKeamananCreate from "./create";
import kontakDaruratKeamananDelete from "./del";

const kontakDaruratKeamanan = new Elysia({ prefix: "/kontak-darurat", tags: ["Keamanan/Kontak Darurat"] })
.get("/find-many", kontakDaruratKeamananFindMany)
.get("/:id", async (context) => {
    const response = await kontakDaruratKeamananFindUnique(new Request(context.request));
    return response;
})
.post("/create", kontakDaruratKeamananCreate, {
    body: t.Object({
        nama: t.String(),
        kontak: t.String(),
        icon: t.String(),
    }),
})
.delete("/del/:id", kontakDaruratKeamananDelete)
.put("/:id", async (context) => {
    const response = await kontakDaruratKeamananCreate(context);
    return response;
},
{
    body: t.Object({
        nama: t.String(),
        kontak: t.String(),
        icon: t.String(),
    }),
})
export default kontakDaruratKeamanan;