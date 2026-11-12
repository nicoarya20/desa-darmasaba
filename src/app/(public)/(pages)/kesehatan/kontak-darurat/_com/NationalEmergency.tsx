import { IconAmbulance, IconSos, IconPhone } from '@tabler/icons-react';
import page from '../../../pemerintahan/layanan/_com/layanan.module.css';
import { phoneInfo } from './kontak-darurat.logic';
import { NATIONAL_EMERGENCY_NUMBERS, type NationalEmergencyNumber } from './kontak-darurat.meta';
import s from './kontak-darurat.module.css';
import { NATIONAL_TEXT as T, KONTAK_TEXT } from './kontak-darurat.text';
import n from './kontak-nasional.module.css';

const ICONS: Record<NationalEmergencyNumber, typeof IconSos> = { '112': IconSos, '119': IconAmbulance };
const TITLE_ID = 'kontak-darurat-nasional';

/**
 * Blok "Darurat nasional" (112, 119) di atas daftar kontak desa: statis, selalu tampil (juga saat daftar
 * memuat/gagal) dan tidak ikut disaring kolom cari, karena bukan data desa dan harus selalu terjangkau.
 */
export function NationalEmergency() {
  return (
    <section className={page.section} aria-labelledby={TITLE_ID}>
      <div className={page.sectionIntro}>
        <h2 id={TITLE_ID} className={page.sectionTitle}>
          {T.title}
        </h2>
        <p className={page.sectionLead}>{T.lead}</p>
      </div>
      <ul className={n.grid} aria-label={T.listLabel}>
        {NATIONAL_EMERGENCY_NUMBERS.map((number) => {
          const Icon = ICONS[number];
          const { name, description } = T.items[number];
          // Nomor pendek → phoneInfo kind 'service': `tel:112` apa adanya, tanpa WhatsApp.
          const telHref = phoneInfo(number)?.telHref ?? `tel:${number}`;
          return (
            <li key={number} className={n.card}>
              <span className={n.icon} aria-hidden>
                <Icon size={26} stroke={1.75} />
              </span>
              <div className={n.body}>
                <p className={n.number}>{number}</p>
                <h3 className={n.name}>{name}</h3>
                <p className={n.desc}>{description}</p>
              </div>
              <a href={telHref} className={`${s.btn} ${s.btnCall} ${n.call}`} aria-label={T.callLabel(number, name)}>
                <IconPhone size={18} stroke={2} aria-hidden />
                {KONTAK_TEXT.call}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
