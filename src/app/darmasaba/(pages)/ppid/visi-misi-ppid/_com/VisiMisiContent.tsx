import { VisuallyHidden } from '@mantine/core';
import { parsePlainListItems } from '../../_com/cms-list.logic';
import shared from '../../_com/ppid-sections.module.css';
import s from './visi-misi.module.css';
import { VISI_MISI_TEXT } from './visi-misi.text';

type Props = {
  /** HTML visi dari editor admin. */
  visi: string;
  /** HTML misi dari editor admin; satu daftar teks polos tampil sebagai kartu bernomor. */
  misi: string;
};

/** Isi halaman Visi dan Misi PPID: moto tipografi besar, kartu visi, dan kisi kartu misi bernomor. */
export function VisiMisiContent({ visi, misi }: Props) {
  // Isi yang bukan satu daftar teks polos (null) dirender apa adanya agar tidak ada yang hilang.
  const misiItems = parsePlainListItems(misi);
  const outlinedIndex = VISI_MISI_TEXT.motoValues.length - 1;

  return (
    <div className={s.root}>
      <section className={s.moto} aria-labelledby="ppid-moto">
        <h2 id="ppid-moto" className={s.eyebrow}>{VISI_MISI_TEXT.moto}</h2>
        <p className={s.motoText}>
          {/* Pembaca layar membaca kalimat utuh; pecahan tipografi di bawah hanya tampilan. */}
          <VisuallyHidden>{VISI_MISI_TEXT.motoStatement}</VisuallyHidden>
          <span className={s.motoLead} aria-hidden="true">{VISI_MISI_TEXT.motoLead}</span>
          <span className={s.motoValues} aria-hidden="true">
            {VISI_MISI_TEXT.motoValues.map((value, i) => (
              <span key={value} className={i === outlinedIndex ? s.outlined : undefined}>
                {value}.{' '}
              </span>
            ))}
          </span>
        </p>
      </section>

      <section className={s.visi} aria-labelledby="ppid-visi">
        <h2 id="ppid-visi" className={s.eyebrow}>{VISI_MISI_TEXT.visi}</h2>
        <div className={s.visiText} dangerouslySetInnerHTML={{ __html: visi }} />
      </section>

      <section className={s.misi} aria-labelledby="ppid-misi">
        <h2 id="ppid-misi" className={s.eyebrow}>{VISI_MISI_TEXT.misi}</h2>
        {misiItems ? (
          <ol className={s.misiGrid}>
            {misiItems.map((item, i) => (
              <li key={i} className={s.misiCard}>
                {/* Urutan sudah dibawa <ol>; angka besar hanya hiasan. */}
                <span className={`${s.misiNumber} ${s.outlined}`} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className={s.misiBody}>{item}</p>
              </li>
            ))}
          </ol>
        ) : (
          <div className={shared.sections}>
            <div className={`${shared.body} ${s.misiRich}`} dangerouslySetInnerHTML={{ __html: misi }} />
          </div>
        )}
      </section>
    </div>
  );
}
