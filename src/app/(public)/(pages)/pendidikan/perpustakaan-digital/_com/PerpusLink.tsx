import { IconExternalLink } from '@tabler/icons-react';
import a from './perpus-aksi.module.css';
import { PERPUS_TEXT as T } from './perpus.text';

type Props = { href: string; variant?: 'brand' | 'light' };

/** Tombol pil ke website perpustakaan: tab baru, `rel` aman, dan keterangan "tab baru" untuk pembaca layar. */
export function PerpusLink({ href, variant = 'brand' }: Props) {
  return (
    <a
      className={variant === 'light' ? a.pillLight : a.pill}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {T.cta}
      <IconExternalLink size={18} stroke={1.75} aria-hidden />
      <span className={a.srOnly}>{T.newTabSr}</span>
    </a>
  );
}
