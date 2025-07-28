import Elysia from "elysia";
import InfoSekolahPAUD from "./info-sekolah-paud";

const Pendidikan = new Elysia({
    prefix: "/api/pendidikan",
    tags: ["Pendidikan"]
})

.use(InfoSekolahPAUD)

export default Pendidikan;