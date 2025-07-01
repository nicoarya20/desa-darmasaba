import Elysia from "elysia";
import KeamananLingkungan from "./keamanan-lingkungan";
import PolsekTerdekat from "./polsek-terdekat";
import PencegahanKriminalitas from "./pencegahan-kriminalitas";
import MenuTipsKeamanan from "./tips-keamanan";
import LaporanPublik from "./laporan-publik";
import LayananPolsek from "./layanan-polsek";
import KontakDaruratKeamanan from "./kontak-darurat-keamanan";

const Keamanan = new Elysia({ prefix: "/api/keamanan", tags: ["Keamanan"] })
.use(KeamananLingkungan)
.use(PolsekTerdekat)
.use(PencegahanKriminalitas)
.use(MenuTipsKeamanan)
.use(LaporanPublik)
.use(LayananPolsek)
.use(KontakDaruratKeamanan)
export default Keamanan;
