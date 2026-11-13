import { statusInfo } from './laporan.logic';
import s from './laporan-status.module.css';

/** Pil status laporan: titik warna + label teks (warna bukan satu-satunya penanda). */
export function LaporanStatus({ status, className }: { status: string | null | undefined; className?: string }) {
  const { label, tone } = statusInfo(status);
  return (
    <span className={[s.status, s[tone], className].filter(Boolean).join(' ')} data-status={tone}>
      <span className={s.dot} aria-hidden />
      {label}
    </span>
  );
}
