import Elysia, { t } from "elysia";
import fileStorageCreate from "./_lib/create";
import fileStorageFindUnique from "./_lib/findUniq";
import { fileStorageFindMany } from "./_lib/findMany";
import fileStorageDelete from "./_lib/del";

const FileStorage = new Elysia({
  prefix: "/fileStorage",
  tags: ["FileStorage"],
})
  .post("/create", fileStorageCreate, {
    body: t.Object({
      name: t.String(),
      file: t.File(),
    }),
  })
  .get("/findUnique/:name", fileStorageFindUnique)
  .get("/findMany", fileStorageFindMany)
  // Pindah ke Sampah; `from` = ID menu sidebar asal (opsional) untuk pengelompokan di Pengaturan → Sampah.
  .delete("/delete/:id", fileStorageDelete, {
    query: t.Object({ from: t.Optional(t.String()) }),
  });

export default FileStorage;
