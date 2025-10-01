import Elysia, { t } from "elysia";
import permohonanInformasiPublikCreate from "./create";
import permohonanInformasiPublikFindMany from "./find-many";
import jenisInformasiFindMany from "./jenisInformasi";
import memperolehInformasiFindMany from "./memperolehInformasi";
import salinanInformasiFindMany from "./salinanInformasi";
import permohonanInformasiPublikFindUnique from "./findUnique";

const PermohonanInformasiPublik = new Elysia({
    prefix: "/permohonaninformasipublik",
    tags: ["PPID/Permohonan Informasi Publik"]
})
    .get("/jenisInformasi/find-many", jenisInformasiFindMany)
    .get("/memperolehInformasi/find-many", memperolehInformasiFindMany)
    .get("/salinanInformasi/find-many", salinanInformasiFindMany)
    .get("/:id", async (context) => {
        const response = await permohonanInformasiPublikFindUnique(context);
        return response;
    })
    .get("/find-many", permohonanInformasiPublikFindMany)
    .post("/create", permohonanInformasiPublikCreate, {
        body: t.Object({
            name: t.String(),
            nik: t.String(),
            notelp: t.String(),
            alamat: t.String(),
            email: t.String(),
            jenisInformasiDimintaId: t.Union([t.String(), t.Null()]),
            caraMemperolehInformasiId: t.Union([t.String(), t.Null()]),
            caraMemperolehSalinanInformasiId: t.Union([t.String(), t.Null()]),
        }),
    })

export default PermohonanInformasiPublik