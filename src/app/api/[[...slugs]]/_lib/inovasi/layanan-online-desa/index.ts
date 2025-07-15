import Elysia from "elysia";
import AdministrasiOnline from "./administrasi-online";


const LayananOnlineDesa = new Elysia({
  prefix: "/layananonlinedesa",
  tags: ["Inovasi/Layanan Online Desa"],



}).use(AdministrasiOnline);

export default LayananOnlineDesa;
