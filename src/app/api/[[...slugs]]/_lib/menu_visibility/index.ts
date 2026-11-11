import { Elysia, t } from "elysia";
import menuVisibilityFindMany from "./findMany";
import menuVisibilityUpdate from "./update";

// GET publik (dipakai siapa saja, tanpa data sensitif); PUT hanya role 0/1 (dicek di handler,
// guard global /api sudah menolak PUT tanpa sesi dengan 401).
const MenuVisibility = new Elysia({ prefix: "/menu-visibility", tags: ["Menu Visibility"] })
  .get("/findMany", menuVisibilityFindMany)
  .put("/update", menuVisibilityUpdate, {
    body: t.Object({
      items: t.Array(
        t.Object({
          menuKey: t.String(),
          // null = hapus override → kembali ke default config
          isVisible: t.Nullable(t.Boolean()),
        }),
        { minItems: 1, maxItems: 200 },
      ),
    }),
  });

export default MenuVisibility;
