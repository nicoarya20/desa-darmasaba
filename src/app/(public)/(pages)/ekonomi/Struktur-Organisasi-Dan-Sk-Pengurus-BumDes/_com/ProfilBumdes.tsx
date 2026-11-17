'use client';
import pi from '@/app/(public)/(pages)/pendidikan/_com/program-info/program-info.module.css';
import { KontakActions } from '@/app/(public)/_com/kontak-darurat/KontakActions';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconAddressBook, IconCalendarEvent, IconMapPin } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import type { GaleriFoto, Profil } from './bumdes.logic';
import s from './bumdes.module.css';
import { BUMDES_TEXT } from './bumdes.text';
import GaleriFotoBumdes from './GaleriFotoBumdes';

const T = BUMDES_TEXT.profil;
const NAME_ID = 'bumdes-profil-nama';

type Props = { profil: LoadState<Profil | null>; galeri: LoadState<GaleriFoto[]> };

/**
 * Bagian profil BUMDes (pola bagian bergaris program-info): kiri logo + nama, kanan deskripsi, fakta (berdiri,
 * alamat, kontak teks), lalu nomor + tombol Telepon/WhatsApp. Galeri di bawahnya; galeri galat/kosong tidak dirender.
 */
export function ProfilBumdes({ profil, galeri }: Props) {
  if (profil.status === 'loading') {
    return <div className={`${kabar.placeholder} ${s.profilPlaceholder}`} aria-busy="true" aria-label={T.loading} />;
  }
  if (profil.status === 'error' || profil.data === null) {
    return (
      <section className={s.block} aria-label={T.label}>
        <p className={kabar.empty}>{profil.status === 'error' ? T.error : T.empty}</p>
      </section>
    );
  }

  const data = profil.data;
  return (
    <section className={`${s.block} ${pi.tokens}`} aria-labelledby={NAME_ID}>
      <div className={pi.sections}>
        <div className={pi.section}>
          <div className={s.profilHead}>
            {data.logo ? <img src={data.logo} alt={T.logoAlt(data.nama)} className={s.logo} loading="lazy" /> : null}
            <h2 id={NAME_ID} className={`${pi.sectionTitle} ${s.profilName}`}>
              {data.nama}
            </h2>
          </div>
          <div className={`${pi.sectionBody} ${s.profilBody}`}>
            {data.paragraphs.length > 0 ? (
              <div className={s.paragraphs}>
                {data.paragraphs.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
            ) : null}
            <ProfilFacts profil={data} />
            {data.phone ? <KontakActions name={data.nama} phone={data.phone} variant="detail" /> : null}
          </div>
        </div>
      </div>
      {galeri.status === 'ready' ? <GaleriFotoBumdes foto={galeri.data} namaBumdes={data.nama} /> : null}
    </section>
  );
}

/** Baris fakta yang terisi saja; tanpa satu pun → tidak dirender. */
function ProfilFacts({ profil }: { profil: Profil }) {
  const rows: { key: string; icon: ReactNode; label: string; value: string }[] = [];
  if (profil.tahunBerdiri !== null) {
    rows.push({ key: 'berdiri', icon: <IconCalendarEvent size={20} stroke={1.5} />, label: T.berdiri, value: T.berdiriValue(profil.tahunBerdiri) });
  }
  if (profil.alamat) rows.push({ key: 'alamat', icon: <IconMapPin size={20} stroke={1.5} />, label: T.alamat, value: profil.alamat });
  if (profil.kontakText) {
    rows.push({ key: 'kontak', icon: <IconAddressBook size={20} stroke={1.5} />, label: T.kontak, value: profil.kontakText });
  }
  if (rows.length === 0) return null;

  return (
    <dl className={s.facts}>
      {rows.map((row) => (
        <div key={row.key} className={s.fact}>
          <span className={s.factIcon} aria-hidden>
            {row.icon}
          </span>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
