import Elysia, { t } from "elysia";
import profilePPIDFindById from "./find-by-id";
import profilePPIDUpdate from "./update";
import editImageProfilePPID from "./edit-img";

const ProfilePPID = new Elysia({
    prefix: "/profileppid",
    tags: ["PPID/Profile PPID"]
})
    .get("/find-by-id", profilePPIDFindById)
    .post("/update", profilePPIDUpdate, {
        body: t.Object({
            id: t.String(),
            name: t.String(),
            biodata: t.String(),
            riwayat: t.String(),
            pengalaman: t.String(),
            unggulan: t.String(),
        })
    })
    .post("/edit-img", editImageProfilePPID)


export default ProfilePPID;
