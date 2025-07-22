import Elysia, { t } from "elysia";

import pejabatDesaFindUnique from "./findUnique";
import pejabatDesaUpdate from "./updt";

const PejabatDesa = new Elysia({
    prefix: "/pejabatdesa",
    tags: ["PPID/Profile PPID"]
})
    .get("/:id", async (context) => {
        const response = await pejabatDesaFindUnique(context)
        return response
    })
    .put("/:id", async (context) => {
        const response = await pejabatDesaUpdate(context)
        return response
    },
    {
        body: t.Object({
            name: t.String(),
            position: t.String(),
            imageId: t.String(),
        })
    }
)


export default PejabatDesa;
