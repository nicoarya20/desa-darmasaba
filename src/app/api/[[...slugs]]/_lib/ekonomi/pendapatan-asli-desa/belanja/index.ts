import Elysia, { t } from "elysia";
import belanjaFindMany from "./findMany";
import belanjaFindUnique from "./findUnique";
import belanjaCreate from "./create";
import belanjaDelete from "./del";
import belanjaUpdate from "./updt";

const Belanja = new Elysia({
    prefix: "/belanja",
    tags: ["Ekonomi/Pendapatan Asli Desa/Belanja"],
})
.get("/find-many", belanjaFindMany)
.get("/:id", async (context) => {
    const response = await belanjaFindUnique(context.request);
    return response;
})
.post("/create", belanjaCreate, {
    body: t.Object({
        name: t.String(),
        value: t.Number(),
    }),
})
.delete("/del/:id", belanjaDelete)
.put("/:id", async (context) => {
    const response = await belanjaUpdate(context);
    return response;
}, {
    body: t.Object({
        name: t.String(),
        value: t.Number(),
    }),
});
export default Belanja;