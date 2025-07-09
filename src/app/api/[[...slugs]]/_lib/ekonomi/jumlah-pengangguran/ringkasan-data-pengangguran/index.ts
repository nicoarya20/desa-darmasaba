import Elysia, { t } from "elysia";
import ringkasanDataPengangguranFindUnique from "./findUnique";
import ringkasanDataPengangguranFindMany from "./findMany";
import ringkasanDataPengangguranCreate from "./create";
import ringkasanDataPengangguranUpdate from "./updt";
import ringkasanDataPengangguranDelete from "./del";

const RingkasanDataPengangguran = new Elysia({
    prefix: "/ringkasandatapengangguran",
    tags: ["Ekonomi/Jumlah Pengangguran/Ringkasan Data Pengangguran"],
})
.get("/:id", async (context) => {
    const response = await ringkasanDataPengangguranFindUnique(
        new Request(context.request)
    );
    return response;
})
.get("/find-many", ringkasanDataPengangguranFindMany)
.post("/create", ringkasanDataPengangguranCreate, {
    body: t.Object({
        year: t.Number(),
        totalUnemployment: t.Number(),
        educatedUnemployment: t.Number(),
        percentageEducatedOfTotal: t.Number(),
        productiveAgePopulation: t.Number(),
        percentageProductiveOfTotal: t.Number(),
        percentageChangeFromPreviousYear: t.Number(),
    }),
})
.put("/:id", ringkasanDataPengangguranUpdate, {
    params: t.Object({
        id: t.String(),
    }),
    body: t.Object({
        year: t.Number(),
        totalUnemployment: t.Number(),
        educatedUnemployment: t.Number(),
        percentageEducatedOfTotal: t.Number(),
        productiveAgePopulation: t.Number(),
        percentageProductiveOfTotal: t.Number(),
        percentageChangeFromPreviousYear: t.Number(),
    }),
})
.delete("/del/:id", ringkasanDataPengangguranDelete, {
    params: t.Object({
        id: t.String(),
    }),
});

export default RingkasanDataPengangguran;
