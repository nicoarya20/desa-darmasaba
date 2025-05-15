import Elysia, { t } from "elysia";
import profileDesaFindMany from "./find-many";
import lambangDesaUpdate from "./lambangDesa";
import maskotDesaUpdate from "./maskotDesa";
import profilePerbekelUpdate from "./profilePerbekel";
import sejarahDesaUpdate from "./sejarahDesa";
import visimisiDesaUpdate from "./visimisiDesa";

const ProfileDesa = new Elysia({
    prefix: "/profile",
    tags: ["Desa/Profile"]
})
.get("/find-many", profileDesaFindMany)
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
.post("/sejarahDesa/update", sejarahDesaUpdate, {
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
