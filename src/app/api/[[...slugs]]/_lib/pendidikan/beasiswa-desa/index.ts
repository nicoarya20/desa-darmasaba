import Elysia from "elysia";
import BeasiswaPendaftar from "./beasiswa-pendaftar";
import KeunggulanProgram from "./keunggulan-program";

const Beasiswa = new Elysia({
    prefix: "/beasiswa",
    tags: ["Pendidikan/Beasiswa Desa"]
})
.use(BeasiswaPendaftar)
.use(KeunggulanProgram)

export default Beasiswa