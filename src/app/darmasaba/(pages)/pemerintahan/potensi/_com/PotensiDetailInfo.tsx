import { Image } from "@mantine/core";
import { dokumentasiImages, potensiInfoRows, type PotensiItem } from "./potensi.logic";
import s from "./potensi-detail.module.css";
import { POTENSI_TEXT } from "./potensi.text";

/** Bagian bawah overlay: kotak Lokasi/Pengelola/Status ("–" bila kosong) lalu galeri Dokumentasi (disembunyikan bila tak ada foto). */
export function PotensiDetailInfo({ item }: { item: PotensiItem }) {
  const fotos = dokumentasiImages(item);

  return (
    <>
      <dl className={s.infoGrid}>
        {potensiInfoRows(item).map(({ key, value }) => (
          <div key={key} className={s.infoCard}>
            <dt className={s.infoLabel}>{POTENSI_TEXT.info[key]}</dt>
            {value ? (
              <dd className={key === "status" ? `${s.infoValue} ${s.infoStatus}` : s.infoValue}>{value}</dd>
            ) : (
              <dd className={`${s.infoValue} ${s.infoEmpty}`}>
                <span aria-hidden>{POTENSI_TEXT.emptyValue}</span>
                <span className={s.srOnly}>{POTENSI_TEXT.emptyValueLabel}</span>
              </dd>
            )}
          </div>
        ))}
      </dl>
      {fotos.length > 0 ? (
        <section className={s.dokumentasi} aria-labelledby="potensi-dokumentasi-title">
          <h3 id="potensi-dokumentasi-title" className={s.sectionLabel}>
            {POTENSI_TEXT.dokumentasi}
          </h3>
          <ul className={s.dokumentasiGrid}>
            {fotos.map((foto, i) => (
              <li key={foto.key}>
                <Image
                  src={foto.link}
                  alt={POTENSI_TEXT.dokumentasiAlt(item.name, i + 1)}
                  className={s.dokumentasiImage}
                  loading="lazy"
                  decoding="async"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
