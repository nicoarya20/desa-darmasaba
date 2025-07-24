import Elysia from "elysia";
import MediaSosial from "./profile/media-sosial";
import ProgramInovasi from "./profile/program-inovasi";
import PejabatDesa from "./profile/pejabat-desa";
import KategoriDesaAntiKorupsi from "./desa-anti-korupsi/kategori-dak";
import DesaAntiKorupsi from "./desa-anti-korupsi";
import SDGSDesa from "./sdgs-desa";
import APBDes from "./apbdes";

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

export default LandingPage
