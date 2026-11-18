import Elysia from "elysia";
import pengaduanMasyarakatCreate from "./create";
import { t } from "elysia";
import pengaduanMasyarakatDelete from "./del";
import pengaduanMasyarakatFindMany from "./findMany";
import pengaduanMasyarakatFindUnique from "./findUnique";
import pengaduanMasyarakatUpload from "./upload";
import pengaduanMasyarakatUpdate from "./updt";
import pengaduanMasyarakatRekap from "./rekap";
import { PENGADUAN_TANGGAPAN_MAX } from "@/lib/pengaduan-status";
import JenisPengaduan from "./jenis-pengaduan";
import { guardDataPribadi } from "../../../_data-pribadi/guard";
import { guardAdmin } from "../../../landing_page/desa-anti-korupsi/admin-guard";

export const PESAN_TANGGAPI_BUKAN_ADMIN = "Hanya admin yang boleh mengubah status dan tanggapan pengaduan";

// Batas kasar badan permintaan sebelum HTML dibuang; batas sebenarnya (PENGADUAN_TANGGAPAN_MAX) dicek setelah sanitasi.
const TANGGAPAN_INPUT_MAX = PENGADUAN_TANGGAPAN_MAX * 5;

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
.post("/upload", pengaduanMasyarakatUpload, {
    body: t.Object({
        name: t.String(),
        file: t.File(),
    }),
})
// `/rekap` PUBLIK (hanya agregat + tanggapan, tanpa data pelapor): statis, jadi menang atas `/:id` yang admin-only.
.get("/rekap", pengaduanMasyarakatRekap)
.get("/find-many", pengaduanMasyarakatFindMany, { beforeHandle: guardDataPribadi })
.get("/:id", pengaduanMasyarakatFindUnique, { beforeHandle: guardDataPribadi })
// Guard global route.ts hanya memastikan login; role admin (0-4) dicek per rute, user Google biasa (role 5) ditolak.
.put("/updt/:id", pengaduanMasyarakatUpdate, {
    beforeHandle: async ({ set }) => (await guardAdmin(set, PESAN_TANGGAPI_BUKAN_ADMIN)) ?? undefined,
    body: t.Object({
        status: t.String(),
        tanggapan: t.Optional(t.String({ maxLength: TANGGAPAN_INPUT_MAX })),
    }),
})
.delete("/del/:id", pengaduanMasyarakatDelete)
.use(JenisPengaduan)
export default PengaduanMasyarakat;