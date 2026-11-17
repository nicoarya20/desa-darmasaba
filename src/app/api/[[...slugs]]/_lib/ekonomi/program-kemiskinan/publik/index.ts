import Elysia, { t } from "elysia";
import programKemiskinanPublik from "./program-publik";
import { penerimaPublikFindMany, penerimaPublikRekap } from "./penerima-publik";

const queryDaftar = t.Object({
  tahun: t.String(),
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  search: t.Optional(t.String()),
});

/**
 * API publik Program Kemiskinan (`/ekonomi/programkemiskinan/publik`): detail program, daftar penerima
 * berpaginasi (hanya nama/alamat/tahun), dan rekap per alamat. Respons diberi `X-Robots-Tag: noindex`
 * agar JSON data warga tidak diindeks mesin pencari.
 */
const ProgramKemiskinanPublik = new Elysia({
  prefix: "/publik",
  tags: ["Ekonomi / Program Kemiskinan"],
})
  .onBeforeHandle(({ set }) => {
    set.headers["x-robots-tag"] = "noindex, nofollow";
  })
  .get("/:key", programKemiskinanPublik)
  .get("/:key/penerima", penerimaPublikFindMany, { query: queryDaftar })
  .get("/:key/rekap", penerimaPublikRekap, { query: t.Object({ tahun: t.String() }) });

export default ProgramKemiskinanPublik;
