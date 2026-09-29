import Elysia from "elysia";
import keamananLingkunganFindUnique from "./findUnique";
import keamananLingkunganCreate from "./create";
import keamananLingkunganUpdate from "./updt";
import keamananLingkunganDelete from "./del";
import { t } from "elysia";
import keamananLingkunganFindMany from "./findMany";

const KeamananLingkungan = new Elysia({ prefix: "/keamananlingkungan", tags: ["Keamanan/Keamanan Lingkungan"] })
.get("/find-many", keamananLingkunganFindMany)
.get("/:id", async (context) => {
    const response = await keamananLingkunganFindUnique(context.request);
    return response;
})
.post("/create", keamananLingkunganCreate, {
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
    }),
})
.delete("/del/:id", keamananLingkunganDelete)
.put("/:id", async (context) => {
    const response = await keamananLingkunganUpdate(context);
    return response;
},
{
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
    }),
})
export default KeamananLingkungan;