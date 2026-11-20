import Elysia, { t } from "elysia";
import kontakDesaFind from "./find";
import kontakDesaUpsert from "./upsert";

// Body sengaja longgar (t.Unknown): aturan isi divalidasi zod di handler (parseKontakDesaInput) supaya semua galat 400
// berbentuk { success: false, message } seperti modul lain.
const kontakDesaBody = t.Object(
  {
    namaKantor: t.Optional(t.Unknown()),
    alamat: t.Optional(t.Unknown()),
    telepon: t.Optional(t.Unknown()),
    email: t.Optional(t.Unknown()),
    whatsapp: t.Optional(t.Unknown()),
  },
  { additionalProperties: true },
);

/** Kontak resmi kantor desa (singleton). GET publik untuk footer & PPID; PUT admin-only di handler. */
const KontakDesa = new Elysia({ prefix: "/kontakdesa", tags: ["Desa/Kontak Desa"] })
  .get("/", kontakDesaFind)
  .put("/", kontakDesaUpsert, { body: kontakDesaBody });

export default KontakDesa;
