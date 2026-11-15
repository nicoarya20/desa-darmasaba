import { IconCalendarTime, IconMapPin, IconUsers, type Icon } from '@tabler/icons-react';
import type { InfoKind, InfoPraktisData } from './bimbingan.logic';
import s from './bimbingan.module.css';

const ICONS: Record<Exclude<InfoKind, null>, Icon> = {
  lokasi: IconMapPin,
  jadwal: IconCalendarTime,
  peserta: IconUsers,
};

const TITLE_ID = 'bimbingan-info-praktis';

/** Panel info praktis: isian "Lokasi dan Jadwal" CMS sebagai pasangan label/nilai (tempat, jadwal, peserta). */
export function InfoPraktis({ data }: { data: InfoPraktisData }) {
  return (
    <section className={s.info} aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.infoTitle}>
        {data.judul}
      </h2>
      <dl className={s.infoList}>
        {data.items.map((item, i) => {
          const ItemIcon = item.kind ? ICONS[item.kind] : null;
          return (
            <div key={`${i}-${item.label}`} className={s.infoItem}>
              <dt className={s.infoLabel}>
                {ItemIcon ? <ItemIcon className={s.infoIcon} size={22} stroke={1.6} aria-hidden /> : null}
                {item.label}
              </dt>
              <dd className={s.infoValue}>{item.value}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
