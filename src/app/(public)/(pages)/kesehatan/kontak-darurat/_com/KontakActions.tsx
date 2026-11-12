import { IconBrandWhatsapp, IconPhone } from '@tabler/icons-react';
import type { PhoneInfo } from './kontak-darurat.logic';
import { WHATSAPP_GREEN } from './kontak-darurat.meta';
import s from './kontak-darurat.module.css';
import { KONTAK_TEXT as T, PHONE_KIND_LABEL } from './kontak-darurat.text';

type Props = { name: string; phone: PhoneInfo | null; variant?: 'row' | 'detail' };

/**
 * Nomor besar + tombol Telepon (`tel:`, tanpa tab baru) dan WhatsApp (wa.me, tab baru, hanya nomor seluler).
 * Nomor kosong → "Nomor belum diisi" tanpa tombol.
 */
export function KontakActions({ name, phone, variant = 'row' }: Props) {
  const detail = variant === 'detail';
  if (!phone) return <p className={s.noNumber}>{T.noNumber}</p>;

  const kind = PHONE_KIND_LABEL[phone.kind];
  return (
    <div className={detail ? `${s.call} ${s.callDetail}` : s.call}>
      <p className={s.number}>
        {kind ? <span className={s.kind}>{kind}</span> : null}
        <span className={s.digits}>{phone.display}</span>
      </p>
      <div className={s.actions}>
        <a href={phone.telHref} className={`${s.btn} ${s.btnCall}`} aria-label={T.callLabel(name)}>
          <IconPhone size={18} stroke={2} aria-hidden />
          {T.call}
        </a>
        {phone.waHref ? (
          <a
            href={phone.waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${s.btn} ${s.btnWa}`}
            aria-label={T.waLabel(name)}
          >
            <IconBrandWhatsapp size={18} stroke={2} color={WHATSAPP_GREEN} aria-hidden />
            {T.whatsapp}
          </a>
        ) : null}
      </div>
    </div>
  );
}
