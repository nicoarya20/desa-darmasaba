import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { ReactNode } from 'react';
import s from './layanan-online.module.css';

/** Satu aksi teks di dasar ubin: tautan (`href`) atau tombol (`onClick`, mis. membuka modal). */
export type LayananTileAction = { label: string; href: string } | { label: string; onClick: () => void };

type Props = { icon: ReactNode; title: string; desc: string; actions: readonly LayananTileAction[] };

/**
 * Ubin layanan `#f5f5f7`: ikon garis, judul, satu kalimat, lalu aksi teks brand "… ›". Bila aksinya satu, seluruh ubin
 * menjadi area klik aksi itu (lapisan `::after`); bila lebih dari satu, tiap aksi diklik sendiri.
 * Sapuan warna (_com/link-reveal): ubin aksi tunggal = pemicu judul + label aksi; aksi ganda = tiap aksi pemicu labelnya.
 */
export function LayananTile({ icon, title, desc, actions }: Props) {
  const stretch = actions.length === 1;
  return (
    <li className={stretch ? `${s.tile} ${r.trigger}` : s.tile}>
      <span className={s.icon} aria-hidden>
        {icon}
      </span>
      <h2 className={s.title}>{stretch ? <span className={r.title}>{title}</span> : title}</h2>
      <p className={s.desc}>{desc}</p>
      <div className={s.actions}>
        {actions.map((action) => (
          <TileAction key={action.label} action={action} stretch={stretch} />
        ))}
      </div>
    </li>
  );
}

function TileAction({ action, stretch }: { action: LayananTileAction; stretch: boolean }) {
  const className = stretch ? `${s.action} ${s.stretch} ${r.trigger}` : `${s.action} ${r.trigger}`;
  const content = (
    <>
      <span className={r.cta} data-text={action.label}>
        {action.label}
      </span>
      <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
    </>
  );
  if ('href' in action) {
    return (
      <Link href={action.href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={action.onClick}>
      {content}
    </button>
  );
}
