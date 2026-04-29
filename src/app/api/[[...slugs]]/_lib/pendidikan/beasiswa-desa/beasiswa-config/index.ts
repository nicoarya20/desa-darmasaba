import Elysia, { t } from "elysia";
import beasiswaConfigFindUnique from "./findUnique";
import beasiswaConfigUpdate from "./updt";

const BeasiswaConfig = new Elysia({ prefix: "/beasiswaconfig", tags: ["Pendidikan/Beasiswa Desa/Config"] })
  .get("/find", beasiswaConfigFindUnique)
  .put("/update", beasiswaConfigUpdate, {
    body: t.Object({
      tahunAjaran: t.String(),
      danaTersalurkan: t.String(),
    }),
  });

export default BeasiswaConfig;
