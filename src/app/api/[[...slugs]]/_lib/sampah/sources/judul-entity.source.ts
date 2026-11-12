import { createEntitySource, type EntityAdapter, type EntityFile, type EntityRow } from "./entity.source";
import { ENTITY_FILE_SELECT, idPageWhere, listWhere, TRASHED_ORDER_BY, TRASHED_WHERE } from "./entity-select";

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

type JudulEntityConfig = Pick<EntityAdapter, "key" | "retensiHari" | "restore"> & {
  /** Delegate dibaca saat dipakai (lazy) agar mock prisma di test ikut terpakai. */
  db: () => JudulEntityDelegate;
  /** Kolom pemilik untuk filter `scopeId` (mis. "apbdesId"); kosong = sumber tanpa scope. */
  scopeField?: string;
  /** True bila entitas punya relasi `folder` (nama folder asal ditampilkan). */
  berFolder?: boolean;
};

type ListRow = { id: string; judul: string; deletedAt: Date | null; file: EntityFile | null; folder?: { nama: string } | null };

/** Sumber Sampah untuk entitas dokumen ber-`judul` + `file`; aturan pulihkan tetap milik domain (`restore`). */
export function createJudulEntitySource({ db, scopeField, berFolder = false, ...config }: JudulEntityConfig) {
  return createEntitySource({
    ...config,
    butuhScope: scopeField !== undefined,
    count: (filter) => db().count({ where: listWhere(filter, scopeField) }),
    async list(filter, skip, take): Promise<EntityRow[]> {
      const rows = (await db().findMany({
        where: listWhere(filter, scopeField),
        orderBy: [...TRASHED_ORDER_BY],
        skip,
        take,
        select: {
          id: true,
          judul: true,
          deletedAt: true,
          file: ENTITY_FILE_SELECT,
          ...(berFolder ? { folder: { select: { nama: true } } } : {}),
        },
      })) as ListRow[];
      return rows.map(({ folder, ...r }) => ({ ...r, deletedAt: r.deletedAt as Date, folderNama: folder?.nama ?? null }));
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
      return (await db().findFirst({ where: { id, ...TRASHED_WHERE }, select: { file: { select: { id: true } } } })) as {
        file: { id: string } | null;
      } | null;
    },
    async deleteTrashed(id) {
      return (await db().deleteMany({ where: { id, ...TRASHED_WHERE } })).count;
    },
  });
}
