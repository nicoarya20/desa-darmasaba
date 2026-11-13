import { IconCircleCheck, IconNavigation } from '@tabler/icons-react';
import { forwardRef } from 'react';
import pills from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import page from '../../../pemerintahan/layanan/_com/layanan.module.css';
import k from '@/app/(public)/_com/kontak-darurat/kontak-darurat.module.css';
import { directionsHref, filledText, jamInfo, layananNames, mapEmbedSrc, type PolsekTerdekat } from './polsek.logic';
import { POLSEK_MAP_SECTION_ID } from './polsek.meta';
import s from './polsek.module.css';
import { POLSEK_TEXT as T } from './polsek.text';

const TITLE_ID = `${POLSEK_MAP_SECTION_ID}-judul`;

type Props = {
  /** Polsek berpeta, urut terdekat; pemilih pil hanya tampil bila lebih dari satu. */
  items: PolsekTerdekat[];
  selected: PolsekTerdekat;
  onSelect: (id: string) => void;
};

/**
 * Bagian "Peta lokasi": SATU iframe Google Maps (lazy) untuk polsek terpilih, bukan iframe per kartu,
 * ditemani info lokasi (nama di Maps, alamat, jam, layanan) dan tombol Petunjuk arah.
 */
export const PolsekMapPanel = forwardRef<HTMLElement, Props>(function PolsekMapPanel({ items, selected, onSelect }, ref) {
  const src = mapEmbedSrc(selected.embedMapUrl);
  const mapsName = filledText(selected.namaTempatMaps);
  const alamat = filledText(selected.alamatMaps) ?? filledText(selected.alamat);
  const jam = jamInfo(selected.jamOperasional);
  const layanan = layananNames(selected);
  const arah = directionsHref(selected.linkPetunjukArah);

  return (
    <section ref={ref} id={POLSEK_MAP_SECTION_ID} className={`${page.section} ${s.mapSection}`} aria-labelledby={TITLE_ID}>
      <div className={page.sectionIntro}>
        <h2 id={TITLE_ID} className={page.sectionTitle}>
          {T.mapTitle}
        </h2>
        {items.length > 1 ? <p className={page.sectionLead}>{T.mapLead}</p> : null}
      </div>

      {items.length > 1 ? (
        <div className={pills.pills} role="group" aria-label={T.mapPickerLabel}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${pills.pill} ${s.pick}`}
              aria-pressed={item.id === selected.id}
              onClick={() => onSelect(item.id)}
            >
              {item.nama}
            </button>
          ))}
        </div>
      ) : null}

      <div className={s.mapLayout}>
        <div className={s.mapFrame}>
          {src ? (
            <iframe
              key={selected.id}
              src={src}
              title={T.mapFrameTitle(selected.nama)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : null}
        </div>

        <div className={s.mapInfo}>
          <h3 className={s.mapName}>{selected.nama}</h3>
          {mapsName && mapsName !== selected.nama ? (
            <p className={s.mapMeta}>
              {T.mapsName}: {mapsName}
            </p>
          ) : null}
          <dl className={s.facts}>
            {alamat ? (
              <div>
                <dt>{T.address}</dt>
                <dd>{alamat}</dd>
              </div>
            ) : null}
            {jam ? (
              <div>
                <dt>{T.hours}</dt>
                <dd>{jam.open24 ? T.open24 : jam.text}</dd>
              </div>
            ) : null}
            {layanan.length > 0 ? (
              <div>
                <dt>{T.services}</dt>
                <dd>
                  <ul className={s.services}>
                    {layanan.map((name) => (
                      <li key={name}>
                        <IconCircleCheck size={18} stroke={1.75} aria-hidden />
                        {name}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>
          {arah ? (
            <a
              href={arah}
              target="_blank"
              rel="noopener noreferrer"
              className={`${k.btn} ${k.btnCall} ${s.mapDirections}`}
              aria-label={T.directionsLabel(selected.nama)}
            >
              <IconNavigation size={18} stroke={2} aria-hidden />
              {T.directions}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
});
