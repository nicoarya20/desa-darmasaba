import Elysia, { t } from "elysia";
import daftarInformasiPublikCreate from "./create";
import daftarInformasiPublikFindMany from "./find-many";
import daftarInformasiPublikFindById from "./find-by-id";
import daftarInformasiPublikEdit from "./edit";
import daftarInformasiPublikDelete from "./del";

const DaftarInformasiPublik = new Elysia({
  prefix: "/daftarinformasipublik",
  tags: ["PPID/Daftar Informasi Publik"],
})
  .put("/:id", daftarInformasiPublikEdit, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      jenisInformasi: t.String(),
      deskripsi: t.String(),
      tanggal: t.String(),
    }),
  })
  .delete("/del/:id", daftarInformasiPublikDelete)
  .get("/:id", async (context) => {
    const response = await daftarInformasiPublikFindById(new Request(context.request))
    return response
  })
  .get("/find-many", daftarInformasiPublikFindMany)
  .post("/create", daftarInformasiPublikCreate, {
    body: t.Object({
      jenisInformasi: t.String(),
      deskripsi: t.String(),
      tanggal: t.String(),
    }),
  });

export default DaftarInformasiPublik;
