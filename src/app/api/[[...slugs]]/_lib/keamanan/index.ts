import Elysia from "elysia";
import KeamananLingkungan from "./keamanan-lingkungan";
import PolsekTerdekat from "./polsek-terdekat";
import KontakDarurat from "./kontak-darurat";
import PencegahanKriminalitas from "./pencegahan-kriminalitas";
import MenuTipsKeamanan from "./tips-keamanan";
import LaporanPublik from "./laporan-publik";

const Keamanan = new Elysia({ prefix: "/api/keamanan", tags: ["Keamanan"] })
.use(KeamananLingkungan)
.use(PolsekTerdekat)
.use(KontakDarurat)
.use(PencegahanKriminalitas)
.use(MenuTipsKeamanan)
.use(LaporanPublik)
export default Keamanan;
