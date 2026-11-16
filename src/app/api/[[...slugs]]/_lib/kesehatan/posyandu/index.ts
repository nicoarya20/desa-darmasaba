import Elysia, { t } from "elysia";
import posyanduCreate from "./create";
import posyanduDelete from "./del";
import findPosyanduById from "./find-by-id";
import posyanduUpdate from "./updt";
import posyanduFindMany from "./find-many";
import PosyanduDaftarAnak from "./posyandu.anak";
import ProfilPosyandu from "./profil";

// `alamat` additive & opsional (klien lama tidak mengirim); isinya divalidasi `alamatPosyanduSchema`.
const posyanduBody = t.Object({
    name: t.String(),
    nomor: t.String(),
    deskripsi: t.String(),
    imageId: t.String(),
    jadwalPelayanan: t.String(),
    banjarId: t.Optional(t.String()),
    alamat: t.Optional(t.Nullable(t.String())),
});

const Posyandu = new Elysia({
    prefix: "/posyandu",
    tags: ["Kesehatan/Posyandu"]
})
// Rute statis `/profil` didaftarkan sebelum `/:id` agar jelas tidak tertangkap sebagai id posyandu.
.use(ProfilPosyandu)
.post("/create", posyanduCreate, { body: posyanduBody })
.get("/find-many", posyanduFindMany)
.delete("/del/:id", posyanduDelete)
.get("/:id", async (context) => {
    const response = await findPosyanduById(context.request);
    return response;
})
.put(
    "/:id",
    async (context) => {
        const response = await posyanduUpdate(context);
        return response;
    },
    { body: posyanduBody }
)
.use(PosyanduDaftarAnak)

export default Posyandu;
