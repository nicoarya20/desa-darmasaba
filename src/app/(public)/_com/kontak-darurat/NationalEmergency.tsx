import { IconPhone } from '@tabler/icons-react';
import page from '../../(pages)/pemerintahan/layanan/_com/layanan.module.css';
import type { NationalEmergencyEntry } from './kontak-darurat.meta';
import s from './kontak-darurat.module.css';
import { KONTAK_CALL_TEXT, NATIONAL_BASE_TEXT as T } from './kontak-darurat.text';
import { phoneInfo } from './kontak-phone.logic';
import n from './kontak-nasional.module.css';

const TITLE_ID = 'kontak-darurat-nasional';

/**
 * Blok "Darurat nasional" di atas daftar kontak desa: statis, selalu tampil (juga saat daftar memuat/gagal)
 * dan tidak ikut disaring kolom cari, karena bukan data desa dan harus selalu terjangkau.
 * Kartu 2 kolom, 1 kolom di tablet, ringkas 2×2 di mobile (nama pendek, tanpa deskripsi); isi dari halaman pemakai.
 */
export function NationalEmergency({ entries }: { entries: readonly NationalEmergencyEntry[] }) {
  return (
    <section className={page.section} aria-labelledby={TITLE_ID}>
      <div className={page.sectionIntro}>
        <h2 id={TITLE_ID} className={page.sectionTitle}>
          {T.title}
        </h2>
        <p className={page.sectionLead}>{T.lead}</p>
      </div>
      <ul className={n.grid} aria-label={T.listLabel}>
        {entries.map(({ number, name, shortName, description, icon: Icon }) => {
          // Nomor pendek → phoneInfo kind 'service': `tel:112` apa adanya, tanpa WhatsApp.
          const telHref = phoneInfo(number)?.telHref ?? `tel:${number}`;
          return (
            <li key={number} className={n.card}>
              <span className={n.icon} aria-hidden>
                <Icon size={26} stroke={1.75} />
              </span>
              <div className={n.body}>
                <p className={n.number}>{number}</p>
                {/* Satu dari dua nama tampil sesuai lebar layar (display: none juga menyembunyikan dari pembaca layar). */}
                <h3 className={n.name}>
                  <span className={n.nameFull}>{name}</span>
                  <span className={n.nameShort}>{shortName}</span>
                </h3>
                <p className={n.desc}>{description}</p>
              </div>
              <a href={telHref} className={`${s.btn} ${s.btnCall} ${n.call}`} aria-label={T.callLabel(number, name)}>
                <IconPhone size={18} stroke={2} aria-hidden />
                {KONTAK_CALL_TEXT.call}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
