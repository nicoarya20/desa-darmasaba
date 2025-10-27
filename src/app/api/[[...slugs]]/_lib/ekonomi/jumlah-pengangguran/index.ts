import Elysia from "elysia";
import DetailDataPengangguran from "./detail-data-pengangguran";

const JumlahPengangguran = new Elysia({
    prefix: "/jumlahpengangguran",
})
.use(DetailDataPengangguran)


export default JumlahPengangguran;