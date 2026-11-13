import { agendaTool } from "./agenda";
import { cariKontenTool } from "./cari-konten";
import { cekKantorBukaTool } from "./cek-kantor-buka";
import { detailKontenTool } from "./detail-konten";
import type { JennaTool } from "./types";

/** Semua tool publik Jenna — read-only, lewat registry allowlist. */
export const JENNA_TOOLS: readonly JennaTool[] = [cariKontenTool, detailKontenTool, agendaTool, cekKantorBukaTool];
