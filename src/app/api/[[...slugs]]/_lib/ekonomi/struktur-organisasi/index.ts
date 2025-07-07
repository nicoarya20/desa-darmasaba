import Elysia from "elysia";
import PosisiOrganisasi from "./posisi-organisasi";
import Pegawai from "./pegawai";
import HubunganOrganisasi from "./hubungan-organisasi";

const StrukturOrganisasi = new Elysia({
    prefix: "/struktur-organisasi",
    tags: ["Ekonomi/Struktur Organisasi"],
})
.use(PosisiOrganisasi)
.use(Pegawai)
.use(HubunganOrganisasi)

export default StrukturOrganisasi;