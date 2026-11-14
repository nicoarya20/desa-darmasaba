import prisma from "@/lib/prisma";
import { delegateName, type KnowledgeRow, type KnowledgeSource } from "./sources";

type FindArgs = { where?: Record<string, unknown>; select?: unknown; orderBy?: unknown; take?: number };
type ReadDelegate = {
  findMany(args: FindArgs): Promise<KnowledgeRow[]>;
  findFirst(args: FindArgs): Promise<KnowledgeRow | null>;
};

// Akses delegate dinamis per model registry. Hanya findMany/findFirst yang diekspos: modul knowledge read-only.
function delegateOf(source: KnowledgeSource): ReadDelegate {
  return (prisma as unknown as Record<string, ReadDelegate>)[delegateName(source.model)];
}

/** Baris sumber dengan `where`/`select`/`orderBy` registry; `extraWhere` di-AND-kan, tidak menimpa filter registry. */
export function findSourceRows(
  source: KnowledgeSource,
  opts: { extraWhere?: Record<string, unknown>; take?: number } = {},
): Promise<KnowledgeRow[]> {
  return delegateOf(source).findMany({
    where: opts.extraWhere ? { AND: [source.where, opts.extraWhere] } : source.where,
    select: source.select,
    orderBy: source.orderBy,
    take: opts.take ?? source.take,
  });
}

/** Satu baris sumber berdasarkan id, tetap lewat filter registry. */
export function findSourceRowById(source: KnowledgeSource, id: string): Promise<KnowledgeRow | null> {
  return delegateOf(source).findFirst({ where: { AND: [source.where, { id }] }, select: source.select });
}
