import { KontakDesaIfJamLayanan, KontakDesaIfWhatsapp, KontakDesaValue } from '@/app/(public)/_com/KontakDesaValue';
import { IconBrandWhatsapp, IconClock, IconMail, IconPhone, type Icon } from '@tabler/icons-react';
import { useId } from 'react';
import s from './kontak-ppid.module.css';
import { KONTAK_PPID_TEXT as TEXT } from './kontak-ppid.text';

type Field = 'email' | 'telepon' | 'whatsapp' | 'jamLayanan';

function Row({ icon: RowIcon, label, field }: { icon: Icon; label: string; field: Field }) {
  return (
    <p className={s.row}>
      <RowIcon size={18} stroke={1.5} aria-hidden />
      <span>
        {label} <span className={s.value}><KontakDesaValue field={field} /></span>
      </span>
    </p>
  );
}

/** Kontak PPID halaman PPID: email, telepon, serta WhatsApp dan jam layanan (hanya bila diisi) kantor desa dari CMS, baris ber-ikon tanpa kartu. */
export function KontakPpid() {
  const titleId = useId();
  return (
    <section className={s.kontak} aria-labelledby={titleId}>
      <h2 id={titleId} className={s.title}>{TEXT.title}</h2>
      <Row icon={IconMail} label={TEXT.emailLabel} field="email" />
      <Row icon={IconPhone} label={TEXT.teleponLabel} field="telepon" />
      <KontakDesaIfWhatsapp>
        <Row icon={IconBrandWhatsapp} label={TEXT.whatsappLabel} field="whatsapp" />
      </KontakDesaIfWhatsapp>
      <KontakDesaIfJamLayanan>
        <Row icon={IconClock} label={TEXT.jamLayananLabel} field="jamLayanan" />
      </KontakDesaIfJamLayanan>
    </section>
  );
}
