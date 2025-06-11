import Elysia, { t } from "elysia";
import strukturPPIDFindById from "./find-by-id";
import strukturPPIDUpdate from "./update";

const StrukturPPID = new Elysia({
    prefix: "/strukturppid",
    tags: ["PPID/Struktur PPID"]
})
.get("/:id", async (context) => {
    const response = await strukturPPIDFindById(new Request(context.request))
    return response
})
.put("/:id", async (context) => {
    const response = await strukturPPIDUpdate(context)
    return response
}, {
    body: t.Object({
        name: t.String(),
        imageId: t.String(),
    })
})

export default StrukturPPID
