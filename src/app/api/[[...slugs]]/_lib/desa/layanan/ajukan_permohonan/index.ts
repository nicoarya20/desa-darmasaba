import Elysia, { t } from "elysia";
import createAjukanPermohonan from "./create";
import findManyAjukanPermohonan from "./findMany";
import findUniqueAjukanPermohonan from "./findUnique";
import updateAjukanPermohonan from "./updt";
import deleteAjukanPermohonan from "./del";
import { guardDataPribadi } from "../../../_data-pribadi/guard";


const AjukanPermohonan = new Elysia({
    prefix: "ajukanpermohonan",
    tags: ["Desa/Layanan/AjukanPermohonan"],
})
.get("/findMany", findManyAjukanPermohonan, { beforeHandle: guardDataPribadi })
.post("/create", createAjukanPermohonan, {
    body: t.Object({
        nama: t.String(),
        nik: t.String(),
        alamat: t.String(),
        nomorKk: t.String(),
        kategoriId: t.String(),
    })
})
.get("/:id", findUniqueAjukanPermohonan, { beforeHandle: guardDataPribadi })
.put("/:id", updateAjukanPermohonan, {
    body: t.Object({
        nama: t.String(),
        nik: t.String(),
        alamat: t.String(),
        nomorKk: t.String(),
        kategoriId: t.String(),
    })
})
.delete("/del/:id", deleteAjukanPermohonan)


export default AjukanPermohonan;
