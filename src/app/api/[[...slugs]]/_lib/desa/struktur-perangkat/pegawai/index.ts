import { t } from "elysia";
import { strukturPerangkatPlugin } from "../plugin";
import pegawaiCreate from "./create";
import pegawaiDelete from "./del";
import pegawaiFindMany from "./findMany";
import pegawaiFindUnique from "./findUnique";
import pegawaiUpdate from "./updt";

const optionalText = t.Optional(t.Nullable(t.String()));

// Sama untuk create & update (kontrak: PUT mengirim semua field; yang kosong = dikosongkan).
const pegawaiBody = t.Object({
  namaLengkap: t.String(),
  posisiId: t.String(),
  gelarAkademik: optionalText,
  imageId: optionalText,
  tanggalMasuk: optionalText, // YYYY-MM-DD
  email: optionalText,
  telepon: optionalText,
  alamat: optionalText,
  isActive: t.Optional(t.Boolean()),
});

const idParams = t.Object({ id: t.String() });

/** Rute pegawai Struktur Perangkat Desa (`/pegawai/*`). */
const PegawaiPerangkatDesa = strukturPerangkatPlugin("/pegawai", "Desa/Struktur Perangkat Desa/Pegawai")
  .get("/find-many", pegawaiFindMany)
  .get("/:id", pegawaiFindUnique, { params: idParams })
  .post("/create", pegawaiCreate, { body: pegawaiBody })
  .put("/:id", pegawaiUpdate, { params: idParams, body: pegawaiBody })
  .delete("/del/:id", pegawaiDelete, { params: idParams });

export default PegawaiPerangkatDesa;
