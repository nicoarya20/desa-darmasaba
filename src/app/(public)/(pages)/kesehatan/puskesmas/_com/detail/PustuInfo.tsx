import KontakLink from '@/app/(public)/_com/konten-bersama/kontak.link';
import TombolGoogleMaps from '@/app/(public)/_com/konten-bersama/lokasi.tombol';
import MediaSosialLinks from '@/app/(public)/_com/konten-bersama/media-sosial.links';
import type { PustuDetail } from '@/lib/pustu/pustu.types';
import { IconAmbulance, IconClock, IconMapPin, IconPhone, type Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { PUSTU_TEXT as T } from '../pustu.text';
import s from '../pustu.module.css';

function Tile({ icon: Icon, label, darurat, children }: { icon: Icon; label: string; darurat?: boolean; children: ReactNode }) {
  return (
    <section className={darurat ? `${s.tile} ${s.tileDarurat}` : s.tile} aria-label={label}>
      <p className={s.tileHead}>
        <span className={s.tileIcon} aria-hidden>
          <Icon size={20} stroke={1.75} />
        </span>
        {label}
      </p>
      {children}
    </section>
  );
}

/** Ubin info PUSTU: alamat (+ tombol peta), jam operasional, kontak & media sosial, kontak darurat; ubin kosong disembunyikan. */
export default function PustuInfo({ data }: { data: PustuDetail }) {
  const telepon = data.kontak?.kontakPuskesmas?.trim() ?? '';
  const email = data.kontak?.email?.trim() ?? '';
  const darurat = data.kontak?.kontakUGD?.trim() ?? '';
  const adaKontak = telepon !== '' || email !== '' || data.mediaSosial.length > 0;

  return (
    <div className={s.infoGrid} data-testid="pustu-info">
      <Tile icon={IconMapPin} label={T.alamat}>
        <p className={s.tileText}>{data.alamat}</p>
        <div>
          <TombolGoogleMaps link={data.linkPetunjukArah} />
        </div>
      </Tile>
      {data.jadwal.length > 0 ? (
        <Tile icon={IconClock} label={T.jam}>
          <ul className={s.jadwalList}>
            {data.jadwal.map((j, i) => (
              <li key={i}>
                <strong>{j.hari}</strong>
                {j.jam}
              </li>
            ))}
          </ul>
        </Tile>
      ) : null}
      {adaKontak ? (
        <Tile icon={IconPhone} label={T.kontak}>
          {telepon ? <KontakLink kontak={telepon} /> : null}
          {email ? (
            <a className={s.emailLink} href={`mailto:${email}`}>
              {email}
            </a>
          ) : null}
          {data.mediaSosial.length > 0 ? (
            <>
              <p className={s.subLabel}>{T.mediaSosial}</p>
              <MediaSosialLinks items={data.mediaSosial} />
            </>
          ) : null}
        </Tile>
      ) : null}
      {darurat ? (
        <Tile icon={IconAmbulance} label={T.darurat} darurat>
          <KontakLink kontak={darurat} />
        </Tile>
      ) : null}
    </div>
  );
}
