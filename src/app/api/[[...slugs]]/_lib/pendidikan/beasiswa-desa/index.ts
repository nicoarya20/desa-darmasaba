import Elysia from "elysia";
import BeasiswaPendaftar from "./beasiswa-pendaftar";

const Beasiswa = new Elysia({
    prefix: "/beasiswa",
    tags: ["Pendidikan/Beasiswa Desa"]
})
.use(BeasiswaPendaftar)

export default Beasiswa