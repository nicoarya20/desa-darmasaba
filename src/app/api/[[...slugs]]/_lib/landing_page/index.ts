import Elysia from "elysia";
import MediaSosial from "./profile/media-sosial";
import ProgramInovasi from "./profile/program-inovasi";
import PejabatDesa from "./profile/pejabat-desa";
import KategoriDesaAntiKorupsi from "./desa-anti-korupsi/kategori-dak";
import DesaAntiKorupsi from "./desa-anti-korupsi";
import SDGSDesa from "./sdgs-desa";
import APBDes from "./apbdes";
import PrestasiDesa from "./prestasi-desa";
import KategoriPrestasi from "./prestasi-desa/kategori-prestasi";
import JenisKelaminResponden from "./indeks_kepuasan/jenis-kelamin-responden";
import PilihanRatingResponden from "./indeks_kepuasan/pilihan-rating-responden";
import UmurResponden from "./indeks_kepuasan/umur-responden";
import Responden from "./indeks_kepuasan/responden";

const LandingPage = new Elysia({
    prefix: "/api/landingpage",
    tags: ["Landing Page/Profile"]
})

.use(MediaSosial)
.use(ProgramInovasi)
.use(PejabatDesa)
.use(KategoriDesaAntiKorupsi)
.use(DesaAntiKorupsi)
.use(SDGSDesa)
.use(APBDes)
.use(PrestasiDesa)
.use(KategoriPrestasi)
.use(JenisKelaminResponden)
.use(PilihanRatingResponden)
.use(UmurResponden)
.use(Responden)

export default LandingPage
