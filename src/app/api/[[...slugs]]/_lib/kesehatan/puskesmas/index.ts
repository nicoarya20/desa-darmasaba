import Elysia, { t } from "elysia";
import puskesmasCreate from "./create";
import puskesmasDelete from "./del";
import puskesmasFindMany from "./find-many";
import findUniquePuskesmas from "./findUnique";
import puskesmasUpdate from "./updt";

const Puskesmas = new Elysia({
  prefix: "puskesmas",
  tags: ["Kesehatan/Puskesmas"],
})
.post("/create", puskesmasCreate, {
  body: t.Object({
    name: t.String(),
    alamat: t.String(),
    imageId: t.String(),
    jam: t.Object({
      workDays: t.String(),
      weekDays: t.String(),
      holiday: t.String(),
    }),
    kontak: t.Object({
      kontakPuskesmas: t.String(),
      email: t.String(),
      facebook: t.String(),
      kontakUGD: t.String(),
    }),
  }),
})
.get("/find-many", puskesmasFindMany)
.delete("/del/:id", puskesmasDelete)
.get("/:id", async (context) => {
    const response = await findUniquePuskesmas(new Request(context.request));
    return response;
  })
  .put(
    "/:id",
    async (context) => {
      const response = await puskesmasUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        alamat: t.String(),
        imageId: t.String(),
        jam: t.Object({
          workDays: t.String(),
          weekDays: t.String(),
          holiday: t.String(),
        }),
        kontak: t.Object({
          kontakPuskesmas: t.String(),
          email: t.String(),
          facebook: t.String(),
          kontakUGD: t.String(),
        }),
      }),
    }
  );

export default Puskesmas;
