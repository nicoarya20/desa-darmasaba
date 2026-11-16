import Elysia, { t } from "elysia";
import ibuHamilCreate from "./create";
import ibuHamilDelete from "./del";
import ibuHamilFindById from "./find-by-id";
import ibuHamilFindMany from "./find-many";
import ibuHamilUpdate from "./updt";
import { guardDataPribadi } from "../../_data-pribadi/guard";

const IbuHamil = new Elysia({ prefix: "/ibuhamil", tags: ["Kesehatan/IbuHamil"] })
  .post("/create", ibuHamilCreate, {
    body: t.Object({
      nama: t.String(),
      nik: t.Optional(t.String()),
      usiaKehamilan: t.Number({ minimum: 0 }),
      hpht: t.Optional(t.String()),
      taksiranLahir: t.Optional(t.String()),
      alamat: t.Optional(t.String()),
      noHp: t.Optional(t.String()),
      catatan: t.Optional(t.String()),
      posyanduId: t.Optional(t.String()),
      status: t.Union([
        t.Literal("AKTIF"),
        t.Literal("MELAHIRKAN"),
        t.Literal("KEGUGURAN"),
        t.Literal("NONAKTIF"),
      ]),
    }),
  })
  .get("/find-many", ibuHamilFindMany, { beforeHandle: guardDataPribadi })
  .delete("/del/:id", ibuHamilDelete)
  .get("/:id", ibuHamilFindById, { beforeHandle: guardDataPribadi })
  .put(
    "/:id",
    ibuHamilUpdate,
    {
      body: t.Object({
        nama: t.String(),
        nik: t.Optional(t.String()),
        usiaKehamilan: t.Number({ minimum: 0 }),
        hpht: t.Optional(t.String()),
        taksiranLahir: t.Optional(t.String()),
        alamat: t.Optional(t.String()),
        noHp: t.Optional(t.String()),
        catatan: t.Optional(t.String()),
        posyanduId: t.Optional(t.String()),
        status: t.Union([
          t.Literal("AKTIF"),
          t.Literal("MELAHIRKAN"),
          t.Literal("KEGUGURAN"),
          t.Literal("NONAKTIF"),
        ]),
      }),
    }
  );

export default IbuHamil;
