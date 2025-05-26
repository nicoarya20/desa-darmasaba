import Elysia, { t } from "elysia";
import lambangDesaUpdate from "./lambangDesa/update";
import maskotDesaUpdate from "./maskotDesa/update";
import profilePerbekelUpdate from "../profilePerbekel/update";
import sejarahDesaUpdate from "./sejarah/update";
import visimisiDesaUpdate from "./visimisiDesa/update";
import profileDesaFindById from "./find-by-id";

const ProfileDesa = new Elysia({
    prefix: "/profile",
    tags: ["Desa/Profile"]
})
.get("/find-by-id", profileDesaFindById)
.post("/profilePerbekel/update", profilePerbekelUpdate, {
    body: t.Object({
        id: t.String(),
        biodata: t.String(),
        pengalaman: t.String(),
        pengalamanOrganisasi: t.String(),
        programUnggulan: t.String(),
    })
})
.post("/visimisiDesa/update", visimisiDesaUpdate, {
    body: t.Object({
        id: t.String(),
        visi: t.String(),
        misi: t.String(),
    })
})
.post("/sejarah/update", sejarahDesaUpdate, {
    body: t.Object({
        id: t.String(),
        sejarah: t.String(),
    })
})
.post("/lambangDesa/update", lambangDesaUpdate, {
    body: t.Object({
        id: t.String(),
        lambang: t.String(),
    })
})
.post("/maskotDesa/update", maskotDesaUpdate, {
    body: t.Object({
        id: t.String(),
        maskot: t.String(),
    })
})



export default ProfileDesa
