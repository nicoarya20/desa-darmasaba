import Elysia, { t } from "elysia";
import peminjamanBukuCreate from "./create";
import peminjamanBukuDelete from "./del";
import peminjamanBukuFindMany from "./findMany";
import peminjamanBukuFindUnique from "./findUnique";
import peminjamanBukuUpdate from "./updt";

const PeminjamanBuku = new Elysia({
  prefix: "/peminjamanbuku",
  tags: ["Pendidikan / Perpustakaan Digital / Peminjaman Buku"],
})

  .post("/create", peminjamanBukuCreate, {
    body: t.Object({
      nama: t.String(),
      noTelp: t.String(),
      alamat: t.String(),
      bukuId: t.String(),
      tanggalPinjam: t.String(),
      batasKembali: t.String(),
      tanggalKembali: t.String(),
      catatan: t.String()
    }),
  })

  .get("/findMany", peminjamanBukuFindMany)
  .get("/:id", async (context) => {
    const response = await peminjamanBukuFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .put("/:id", peminjamanBukuUpdate, {
    body: t.Object({
      nama: t.String(),
      noTelp: t.String(),
      alamat: t.String(),
      bukuId: t.String(),
      tanggalPinjam: t.String(),
      batasKembali: t.String(),
      tanggalKembali: t.String(),
      catatan: t.String(),
      status: t.String()
    }),
  })
  .delete("/del/:id", peminjamanBukuDelete);

export default PeminjamanBuku;
