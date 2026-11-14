import type { JennaKnowledgeSourceDTO } from '@/lib/jenna/knowledge-types';
import { formatNumber } from '../../_com/format';
import type { UsageTone } from '../percakapan/percakapan.logic';

export type SnapshotSizeUsage = {
  /** 0–100, untuk lebar progress bar. */
  percent: number;
  tone: UsageTone;
  label: string;
};

const WARN_AT = 80;

/** Ukuran snapshot terhadap batas karakter. Terpotong = galat walau persentasenya di bawah 100. */
export function snapshotSizeUsage(chars: number, maxChars: number, truncated: boolean): SnapshotSizeUsage {
  const raw = (chars / maxChars) * 100;
  const percent = Math.min(100, Math.max(0, raw));
  const tone: UsageTone = truncated ? 'error' : raw >= WARN_AT ? 'warn' : 'ok';
  const shown = raw > 0 && raw < 1 ? '<1' : formatNumber(Math.floor(raw));
  return { percent, tone, label: `${formatNumber(chars)} dari ${formatNumber(maxChars)} karakter (${shown}%)` };
}

/** Detik cache chat publik → menit (dibulatkan, minimal 1). */
export const revalidateMinutes = (seconds: number) => Math.max(1, Math.round(seconds / 60));

export type KnowledgeTier = JennaKnowledgeSourceDTO['tier'];

export const TIER_ORDER: readonly KnowledgeTier[] = ['A', 'B', 'C', 'D'];

export const TIER_META: Record<KnowledgeTier, { label: string; hint: string }> = {
  A: { label: 'Fakta inti', hint: 'Profil desa, pemerintahan, dan PPID. Isinya masuk utuh ke snapshot.' },
  B: { label: 'Layanan & kontak', hint: 'Layanan desa dan kontak darurat.' },
  C: { label: 'Konten terbaru', hint: 'Hanya judul terbaru yang masuk snapshot; isi lengkap diambil lewat tool.' },
  D: { label: 'Data angka', hint: 'APBDes, kependudukan, dan data statistik lain.' },
};

export type SourceGroup = { tier: KnowledgeTier; sources: JennaKnowledgeSourceDTO[] };

/** Kelompokkan per tier (A→D), urutan sumber di dalam tier mengikuti registry; tier kosong dilewati. */
export function groupSourcesByTier(sources: readonly JennaKnowledgeSourceDTO[]): SourceGroup[] {
  return TIER_ORDER.map((tier) => ({ tier, sources: sources.filter((s) => s.tier === tier) })).filter(
    (group) => group.sources.length > 0,
  );
}

export type SourcesSummary = { total: number; visible: number; hidden: number; rows: number };

export function sourcesSummary(sources: readonly JennaKnowledgeSourceDTO[]): SourcesSummary {
  const visible = sources.filter((s) => s.visible).length;
  return {
    total: sources.length,
    visible,
    hidden: sources.length - visible,
    rows: sources.reduce((sum, s) => sum + s.rows, 0),
  };
}
