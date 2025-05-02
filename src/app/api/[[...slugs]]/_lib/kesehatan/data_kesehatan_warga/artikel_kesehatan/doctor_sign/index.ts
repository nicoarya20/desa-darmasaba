import Elysia, { t } from "elysia"
import doctorSignCreate from "./create"
import doctorSignFindMany from "./find-many"

const DoctorSign = new Elysia({
    prefix: "/doctor_sign",
    tags: ["Data Kesehatan/Artikel Kesehatan/Doctor Sign"],
})
    .get("/find-many", doctorSignFindMany)
    .post("/create", doctorSignCreate, {
        body: t.Object({
            content: t.String(),
        }),
    })
export default DoctorSign
