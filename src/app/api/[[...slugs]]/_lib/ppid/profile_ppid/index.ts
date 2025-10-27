import Elysia, { t } from "elysia";
import profilePPIDFindById from "./find-by-id";
import profilePPIDUpdate from "./update";

const ProfilePPID = new Elysia({
    prefix: "/profileppid",
    tags: ["PPID/Profile PPID"]
})
    .get("/:id", async (context) => {
        const response = await profilePPIDFindById(new Request(context.request))
        return response
    })
    .put("/:id", async (context) => {
        const response = await profilePPIDUpdate(context)
        return response
    },
    {
        body: t.Object({
            name: t.String(),
            biodata: t.String(),
            riwayat: t.String(),
            pengalaman: t.String(),
            unggulan: t.String(),
            imageId: t.String(),
        })
    }
)


export default ProfilePPID;
