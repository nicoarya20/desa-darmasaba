import type { APBDes } from "@/app/(public)/_com/main-page/apbdes/types/apbdes";
import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { buildPadesView, type PadesView } from "./padesa.logic";
import { PADESA_FETCH_LIMIT } from "./padesa.meta";

type ApbdesFindManyBody = {
  success?: boolean;
  data?: unknown;
  meta?: { total?: number };
} | null | undefined;

/** Satu permintaan APBDes publik (item + realisasi), lalu diolah jadi tampilan PADes (pos 4.1). */
export async function loadPadesa(): Promise<PadesView> {
  const res = await ApiFetch.api.landingpage.apbdes.findMany.get({
    query: { page: "1", limit: String(PADESA_FETCH_LIMIT) },
  });
  const body = res.data as ApbdesFindManyBody;
  if (res.status !== 200 || !body?.success || !Array.isArray(body.data)) {
    throw new Error(`find-many APBDes (Pendapatan Asli Desa) gagal (HTTP ${res.status}): ${getServerMessage(res) ?? "respons tidak valid"}`);
  }
  const list = body.data as APBDes[];
  const total = Number(body.meta?.total);
  if (Number.isFinite(total) && total > list.length) {
    console.warn(`APBDes: ${total} tahun, hanya ${list.length} pertama yang dibaca halaman Pendapatan Asli Desa.`);
  }
  return buildPadesView(list);
}
