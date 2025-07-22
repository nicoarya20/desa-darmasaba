import Elysia from "elysia";
import MediaSosial from "./profile/media-sosial";
import ProgramInovasi from "./profile/program-inovasi";
import PejabatDesa from "./profile/pejabat-desa";

const LandingPage = new Elysia({
    prefix: "/api/landingpage",
    tags: ["Landing Page/Profile"]
})

.use(MediaSosial)
.use(ProgramInovasi)
.use(PejabatDesa)

export default LandingPage
