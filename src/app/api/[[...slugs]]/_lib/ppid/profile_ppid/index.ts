import Elysia, { t } from "elysia";
import profilePPIDCreate from "./create";
import profilePPIDFindMany from "./find-many";

const ProfilePPID = new Elysia({
    prefix: "/profileppid",
    tags: ["PPID/Profile PPID"]
})
    .get("/find-many", profilePPIDFindMany)
    .post("/create", profilePPIDCreate, {
        body: t.Object({
            name: t.String(),
            biodata: t.String(),
            riwayat: t.String(),
            pengalaman: t.String(),
            unggulan: t.String(),
        })
    })


export default ProfilePPID;
