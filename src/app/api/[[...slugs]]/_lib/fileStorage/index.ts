import Elysia, { t } from "elysia";
import fileStorageCreate from "./_lib/create";
import fileStorageFindUnique from "./_lib/findUniq";
import { fileStorageFindMany } from "./_lib/findMany";

const FileStorage = new Elysia({
  prefix: "/api/fileStorage",
  tags: ["FileStorage"],
})
  .post("/create", fileStorageCreate, {
    body: t.Object({
      name: t.String(),
      file: t.File(),
    }),
  })
  .get("/findUnique/:name", fileStorageFindUnique)
  .get("/findMany", fileStorageFindMany);

export default FileStorage;
