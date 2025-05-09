import Elysia from "elysia";
import MisiPPID from "./misi_ppid";

const VisiMisiPPID = new Elysia({ prefix: "/visimisippid", tags: ["PPID/Visi Misi PPID"] })
.use(MisiPPID)

export default VisiMisiPPID