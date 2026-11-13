import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { sanitizeRichText } from '@/lib/rich-text';
import { formatTanggalWaktu, statusInfo, type LaporanPublik } from '../laporan.logic';
import { LaporanStatus } from '../LaporanStatus';
import s from './laporan-detail.module.css';
import { LAPORAN_DETAIL_TEXT as T } from './laporan-detail.text';

type Step = { key: string; label: string; time?: string | null; html: string; empty?: string; tone: string };

/** Urutan langkah linimasa: kronologi pelapor → tiap penanganan (kosong dibuang) → status saat ini. */
export function linimasaSteps(data: LaporanPublik): Step[] {
  const penanganan = (data.penanganan ?? [])
    .map((p) => ({ id: p.id, html: sanitizeRichText(p.deskripsi) }))
    .filter((p) => p.html !== '');
  const steps: Step[] = [
    {
      key: 'kronologi',
      label: T.kronologi,
      time: formatTanggalWaktu(data.tanggalWaktu),
      html: sanitizeRichText(data.kronologi),
      empty: T.kronologiEmpty,
      tone: 'brand',
    },
  ];
  if (penanganan.length === 0) {
    steps.push({ key: 'penanganan', label: T.penanganan, html: '', empty: T.penangananEmpty, tone: 'kosong' });
  }
  penanganan.forEach((p, i) => {
    const label = penanganan.length > 1 ? T.penangananN(i + 1) : T.penanganan;
    steps.push({ key: `penanganan-${p.id}`, label, html: p.html, tone: 'brand' });
  });
  return steps;
}

/** Linimasa vertikal "Perkembangan laporan": kronologi → penanganan → status saat ini (teks + warna). */
export function LaporanLinimasa({ data, titleId }: { data: LaporanPublik; titleId: string }) {
  const steps = linimasaSteps(data);
  const status = statusInfo(data.status);
  const statusDesc = T.statusDesc[data.status?.trim() ?? ''];

  return (
    <section className={s.block} aria-labelledby={titleId}>
      <h2 id={titleId} className={s.blockTitle}>
        {T.linimasa}
      </h2>
      <ol className={s.timeline}>
        {steps.map((step) => (
          <li key={step.key} className={s.step} data-tone={step.tone}>
            <span className={s.marker} aria-hidden />
            <div className={s.stepHead}>
              <h3 className={s.stepLabel}>{step.label}</h3>
              {step.time ? <time className={s.stepTime} dateTime={data.tanggalWaktu}>{step.time}</time> : null}
            </div>
            {step.html ? (
              // Disanitasi DOMPurify (tag teks dasar saja): kronologi berasal dari formulir publik tanpa moderasi.
              <div className={`${d.content} ${s.stepContent}`} dangerouslySetInnerHTML={{ __html: step.html }} />
            ) : (
              <p className={s.stepEmpty}>{step.empty}</p>
            )}
          </li>
        ))}
        <li className={s.step} data-tone={status.tone}>
          <span className={s.marker} aria-hidden />
          <div className={s.stepHead}>
            <h3 className={s.stepLabel}>{T.statusTitle}</h3>
          </div>
          <div className={s.statusRow}>
            <LaporanStatus status={data.status} />
            {statusDesc ? <p className={s.statusDesc}>{statusDesc}</p> : null}
          </div>
        </li>
      </ol>
    </section>
  );
}
