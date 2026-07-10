/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";
import {
  banjarWhereDirect,
  banjarWhereViaPosyandu,
  orSearch,
  searchFields,
} from "./_where";

// Blok hasil per-dataset. `data` shape berbeda per model → any[].
type Block = {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// runBlock = SATU-SATUNYA penulis `errors` (tanggung jawab terpusat).
// Query helper hanya throw; kegagalan satu dataset tidak menggagalkan keseluruhan.
async function runBlock(
  key: string,
  fn: () => Promise<Block>,
  page: number,
  limit: number,
  errors: Record<string, string>
): Promise<Block> {
  try {
    return await fn();
  } catch (e) {
    console.error(`Error riwayatWarga[${key}]:`, e);
    errors[key] = `Gagal mengambil data ${key}`;
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }
}

async function queryIbuHamil(
  where: any,
  skip: number,
  limit: number,
  page: number
): Promise<Block> {
  const [data, total] = await Promise.all([
    prisma.ibuHamil.findMany({
      where,
      include: {
        posyandu: {
          select: {
            id: true,
            name: true,
            banjar: { select: { id: true, name: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.ibuHamil.count({ where }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function queryBalita(
  where: any,
  skip: number,
  limit: number,
  page: number
): Promise<Block> {
  const [data, total] = await Promise.all([
    prisma.balita.findMany({
      where,
      include: {
        posyandu: {
          select: {
            id: true,
            name: true,
            banjar: { select: { id: true, name: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.balita.count({ where }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function queryPenyakit(
  where: any,
  skip: number,
  limit: number,
  page: number
): Promise<Block> {
  const [data, total] = await Promise.all([
    prisma.grafikKepuasan.findMany({
      where,
      include: { banjar: { select: { id: true, name: true } } },
      skip,
      take: limit,
      orderBy: { nama: "asc" },
    }),
    prisma.grafikKepuasan.count({ where }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// GET /api/kesehatan/riwayatwarga/find-many
// Agregat 3 dataset kesehatan warga + daftar banjar untuk dropdown, dalam 1 call.
export default async function riwayatWargaFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const banjarId = (context.query.banjarId as string) || "";
  const skip = (page - 1) * limit;
  const errors: Record<string, string> = {};

  const whereIbu: any = { isActive: true };
  const whereBal: any = { isActive: true };
  const wherePen: any = { isActive: true };

  if (banjarId) {
    Object.assign(whereIbu, banjarWhereViaPosyandu(banjarId));
    Object.assign(whereBal, banjarWhereViaPosyandu(banjarId));
    Object.assign(wherePen, banjarWhereDirect(banjarId));
  }

  const orI = orSearch(searchFields.ibuHamil, search);
  if (orI) whereIbu.OR = orI;
  const orB = orSearch(searchFields.balita, search);
  if (orB) whereBal.OR = orB;
  const orP = orSearch(searchFields.penyakit, search);
  if (orP) wherePen.OR = orP;

  const [ibuHamil, balita, penyakit, banjarList] = await Promise.all([
    runBlock("ibuHamil", () => queryIbuHamil(whereIbu, skip, limit, page), page, limit, errors),
    runBlock("balita", () => queryBalita(whereBal, skip, limit, page), page, limit, errors),
    runBlock("penyakit", () => queryPenyakit(wherePen, skip, limit, page), page, limit, errors),
    // Inline (bukan reuse banjarFindMany) — self-contained & portable.
    prisma.banjar.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    success: true,
    banjarId: banjarId || null,
    banjarList,
    ibuHamil,
    balita,
    penyakit,
    ...(Object.keys(errors).length ? { errors } : {}),
  };
}
