import Elysia from "elysia";
import pengaduanMasyarakatCreate from "./create";
import { t } from "elysia";
import pengaduanMasyarakatDelete from "./del";
import pengaduanMasyarakatFindMany from "./findMany";
import pengaduanMasyarakatFindUnique from "./findUnique";
import JenisPengaduan from "./jenis-pengaduan";

const PengaduanMasyarakat = new Elysia({
    prefix: "/pengaduanmasyarakat",
    tags: ["Inovasi/Layanan Online Desa/Pengaduan Masyarakat"],
})
.post("/create", pengaduanMasyarakatCreate, {
    body: t.Object({
        name: t.String(),
        email: t.String(),
        nomorTelepon: t.String(),
        nik: t.String(),
        judulPengaduan: t.String(),
        lokasiKejadian: t.String(),
        deskripsiPengaduan: t.String(),
        jenisPengaduanId: t.String(),
        imageId: t.String(),
    }),
})
.get("/find-many", pengaduanMasyarakatFindMany)
.get("/:id", pengaduanMasyarakatFindUnique)
.delete("/del/:id", pengaduanMasyarakatDelete)
.use(JenisPengaduan)
export default PengaduanMasyarakat;