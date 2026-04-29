import Elysia from "elysia";
import BeasiswaPendaftar from "./beasiswa-pendaftar";
import KeunggulanProgram from "./keunggulan-program";
import BeasiswaConfig from "./beasiswa-config";

const Beasiswa = new Elysia({
    prefix: "/beasiswa",
    tags: ["Pendidikan/Beasiswa Desa"]
})
.use(BeasiswaPendaftar)
.use(KeunggulanProgram)
.use(BeasiswaConfig)

export default Beasiswa