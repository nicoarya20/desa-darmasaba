import d from './kabar-detail.module.css';

/** Kerangka halaman detail gaya Kabar saat memuat (meta, dua baris judul, area foto). */
export function KabarDetailPlaceholder({ label }: { label: string }) {
  return (
    <div className={d.placeholder} aria-label={label}>
      <span className={`${d.bar} ${d.barMeta}`} />
      <span className={`${d.bar} ${d.barTitle}`} />
      <span className={`${d.bar} ${d.barTitleShort}`} />
      <span className={`${d.bar} ${d.barFigure}`} />
    </div>
  );
}
