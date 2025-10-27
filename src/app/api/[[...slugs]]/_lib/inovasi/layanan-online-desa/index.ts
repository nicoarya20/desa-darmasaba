import Elysia from "elysia";
import AdministrasiOnline from "./administrasi-online";
import PengaduanMasyarakat from "./pengaduan-masyarakat";

const LayananOnlineDesa = new Elysia({
  prefix: "/layananonlinedesa",
  tags: ["Inovasi/Layanan Online Desa"],
})
.use(AdministrasiOnline)
.use(PengaduanMasyarakat)


export default LayananOnlineDesa;
