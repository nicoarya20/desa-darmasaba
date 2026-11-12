import { createEntitySource, type EntityAdapter, type EntityFile, type EntityRow } from "./entity.source";
import { ENTITY_FILE_SELECT, idPageWhere, judulContains, TRASHED_ORDER_BY, TRASHED_WHERE } from "./entity-select";

// Argumen query Prisma berbeda tipe per model; bentuk hasil dijaga oleh `select` di bawah.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- delegate Prisma beda model tidak punya supertipe bersama
type DelegateArgs = any;

/** Operasi delegate Prisma entitas ber-`judul` + relasi `file` (DokumenDesaAntiKorupsi, DokumenAPBDes, DokumenPerencanaan). */
export type JudulEntityDelegate = {
  count(args: DelegateArgs): Promise<number>;
  findMany(args: DelegateArgs): Promise<unknown>;
  findFirst(args: DelegateArgs): Promise<unknown>;
  deleteMany(args: DelegateArgs): Promise<{ count: number }>;
};

type JudulEntityConfig = Pick<EntityAdapter, "key" | "menuId" | "retensiHari" | "restore"> & {
  /** Delegate dibaca saat dipakai (lazy) agar mock prisma di test ikut terpakai. */
  db: () => JudulEntityDelegate;
};

type ListRow = { id: string; judul: string; deletedAt: Date | null; file: EntityFile | null };

/** Sumber Sampah untuk entitas dokumen ber-`judul` + `file`; aturan pulihkan tetap milik domain (`restore`). */
export function createJudulEntitySource({ db, ...config }: JudulEntityConfig) {
  return createEntitySource({
    ...config,
    count: (cari) => db().count({ where: { ...TRASHED_WHERE, ...judulContains(cari) } }),
    async list(cari, take): Promise<EntityRow[]> {
      const rows = (await db().findMany({
        where: { ...TRASHED_WHERE, ...judulContains(cari) },
        orderBy: [...TRASHED_ORDER_BY],
        take,
        select: { id: true, judul: true, deletedAt: true, file: ENTITY_FILE_SELECT },
      })) as ListRow[];
      return rows.map((r) => ({ ...r, deletedAt: r.deletedAt as Date }));
    },
    async findIds(deletedBefore, take, afterId) {
      const rows = (await db().findMany({
        where: idPageWhere(deletedBefore, afterId),
        orderBy: { id: "asc" },
        take,
        select: { id: true },
      })) as { id: string }[];
      return rows.map((r) => r.id);
    },
    async findTrashed(id) {
      return (await db().findFirst({ where: { id, ...TRASHED_WHERE }, select: { file: ENTITY_FILE_SELECT } })) as {
        file: EntityFile | null;
      } | null;
    },
    async deleteTrashed(id) {
      return (await db().deleteMany({ where: { id, ...TRASHED_WHERE } })).count;
    },
  });
}
