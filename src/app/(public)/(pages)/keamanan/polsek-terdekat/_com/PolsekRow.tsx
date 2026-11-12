import { IconClock, IconExternalLink, IconMap2, IconShieldCheck } from '@tabler/icons-react';
// Nomor + tombol Telepon, pil, panel, dan kerangka dari modul bersama Kontak Darurat.
import { KontakActions } from '@/app/(public)/_com/kontak-darurat/KontakActions';
import k from '@/app/(public)/_com/kontak-darurat/kontak-darurat.module.css';
import { phoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';
import { directionsHref, filledText, formatJarak, jamInfo, mapEmbedSrc, parseJarakKm, type PolsekTerdekat } from './polsek.logic';
import { POLSEK_MAP_SECTION_ID } from './polsek.meta';
import s from './polsek.module.css';
import { POLSEK_TEXT as T } from './polsek.text';

type Props = {
  item: PolsekTerdekat;
  nearest: boolean;
  onMap: boolean;
  onShowOnMap: (id: string) => void;
};

/**
 * Satu kantor polisi: ubin jarak · nama (+ "Terdekat") · jam · alamat · Petunjuk arah / Lihat di peta ·
 * nomor + tombol Telepon. Field kosong/"-" tidak ditampilkan sama sekali.
 */
export function PolsekRow({ item, nearest, onMap, onShowOnMap }: Props) {
  const km = parseJarakKm(item.jarakKeDesa);
  const jarak = km === null ? null : formatJarak(km);
  const jam = jamInfo(item.jamOperasional);
  const alamat = filledText(item.alamat);
  const phone = phoneInfo(item.nomorTelepon);
  const arah = directionsHref(item.linkPetunjukArah);
  const hasMap = mapEmbedSrc(item.embedMapUrl) !== null;

  return (
    <li className={s.row}>
      {jarak ? (
        <p className={s.distance} aria-label={T.distanceLabel(jarak.value, jarak.unit)}>
          <span className={s.distanceValue}>{jarak.value}</span>
          <span className={s.distanceUnit}>{jarak.unit}</span>
        </p>
      ) : (
        <span className={`${s.distance} ${s.distanceIcon}`} aria-hidden>
          <IconShieldCheck size={30} stroke={1.5} />
        </span>
      )}

      <div className={s.body}>
        <h3 className={s.name}>
          {item.nama}
          {nearest ? <span className={s.nearest}>{T.nearest}</span> : null}
        </h3>
        {jam ? (
          <p className={jam.open24 ? `${s.hours} ${s.open24}` : s.hours}>
            {jam.open24 ? <span className={s.dot} aria-hidden /> : <IconClock size={16} stroke={1.75} aria-hidden />}
            {jam.open24 ? T.open24 : jam.text}
          </p>
        ) : null}
        {alamat ? <p className={s.address}>{alamat}</p> : null}
        {arah || hasMap ? (
          <div className={s.links}>
            {arah ? (
              <a
                href={arah}
                target="_blank"
                rel="noopener noreferrer"
                className={`${k.btn} ${k.btnWa} ${s.smallBtn}`}
                aria-label={T.directionsLabel(item.nama)}
              >
                <IconExternalLink size={17} stroke={2} aria-hidden />
                {T.directions}
              </a>
            ) : null}
            {hasMap ? (
              <button
                type="button"
                className={s.mapLink}
                aria-controls={POLSEK_MAP_SECTION_ID}
                aria-pressed={onMap}
                aria-label={T.showOnMapLabel(item.nama)}
                onClick={() => onShowOnMap(item.id)}
              >
                <IconMap2 size={17} stroke={1.75} aria-hidden />
                {T.showOnMap}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {phone ? <KontakActions name={item.nama} phone={phone} /> : null}
    </li>
  );
}

