import Elysia from "elysia";
import ProgramUnggulan from "./program-unggulan";
import TujuanProgram from "./tujuan-program";

const ProgramPendidikanAnak = new Elysia({
    prefix: "/programpendidikananak",
    tags: ["Pendidikan/Program Pendidikan Anak"]
})
.use(ProgramUnggulan)
.use(TujuanProgram)

export default ProgramPendidikanAnak
