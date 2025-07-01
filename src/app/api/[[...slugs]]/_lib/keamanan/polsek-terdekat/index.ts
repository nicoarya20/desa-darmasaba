import Elysia, { t } from "elysia";
import polsekTerdekatCreate from "./create";
import polsekTerdekatDelete from "./del";
import polsekTerdekatFindMany from "./findMany";
import polsekTerdekatFindUnique from "./findUnique";
import polsekTerdekatUpdate from "./updt";


const PolsekTerdekat = new Elysia({ prefix: "/polsekterdekat", tags: ["Keamanan/Polsek Terdekat"] })
.get("/find-many", polsekTerdekatFindMany)
.get("/:id", async (context) => {
    const response = await polsekTerdekatFindUnique(new Request(context.request));
    return response;
})
.post("/create", polsekTerdekatCreate, {
    body: t.Object({
        nama: t.String(),
        jarakKeDesa: t.String(),
        alamat: t.String(),
        nomorTelepon: t.String(),
        jamOperasional: t.String(),
        embedMapUrl: t.String(),
        namaTempatMaps: t.String(),
        alamatMaps: t.String(),
        linkPetunjukArah: t.String(),
        layananPolsekId: t.String(),
    }),
})
.delete("/del/:id", polsekTerdekatDelete)
.put("/:id", async (context) => {
    const response = await polsekTerdekatUpdate(context);
    return response;
},
{
    body: t.Object({
        nama: t.String(),
        jarakKeDesa: t.String(),
        alamat: t.String(),
        nomorTelepon: t.String(),
        jamOperasional: t.String(),
        embedMapUrl: t.String(),
        namaTempatMaps: t.String(),
        alamatMaps: t.String(),
        linkPetunjukArah: t.String(),
        layananPolsekId: t.String(),
    }),
})

export default PolsekTerdekat;