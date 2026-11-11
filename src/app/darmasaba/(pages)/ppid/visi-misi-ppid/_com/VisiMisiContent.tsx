import { Image } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { parsePlainListItems } from '../../_com/cms-list.logic';
import shared from '../../_com/ppid-sections.module.css';
import s from './visi-misi.module.css';
import { VISI_MISI_TEXT } from './visi-misi.text';

/** Lambang desa di kepala kartu. */
const LOGO_SRC = '/darmasaba-icon.png';

type Props = {
  /** HTML visi dari editor admin. */
  visi: string;
  /** HTML misi dari editor admin; satu daftar teks polos tampil sebagai butir bernomor. */
  misi: string;
};

/** Pemisah antarbagian: dua garis pendek mengapit ornamen. */
function Ornament() {
  return (
    <div className={s.ornament} aria-hidden="true">
      <IconSparkles size={18} stroke={1.5} />
    </div>
  );
}

/** Isi halaman Visi dan Misi PPID: satu kartu terpusat berisi lambang desa, moto, visi, dan misi. */
export function VisiMisiContent({ visi, misi }: Props) {
  // Isi yang bukan satu daftar teks polos (null) dirender apa adanya agar tidak ada yang hilang.
  const misiItems = parsePlainListItems(misi);

  return (
    <div className={s.card}>
      <section className={s.section} aria-labelledby="ppid-moto">
        <Image className={s.logo} src={LOGO_SRC} alt={VISI_MISI_TEXT.logoAlt} />
        <h2 id="ppid-moto" className={s.motoTitle}>{VISI_MISI_TEXT.moto}</h2>
        <p className={s.motoText}>{VISI_MISI_TEXT.motoStatement}</p>
      </section>

      <Ornament />

      <section className={s.section} aria-labelledby="ppid-visi">
        <h2 id="ppid-visi" className={s.title}>{VISI_MISI_TEXT.visi}</h2>
        <div className={s.visiText} dangerouslySetInnerHTML={{ __html: visi }} />
      </section>

      <Ornament />

      <section className={s.section} aria-labelledby="ppid-misi">
        <h2 id="ppid-misi" className={s.title}>{VISI_MISI_TEXT.misi}</h2>
        {misiItems ? (
          <ol className={s.misiList}>
            {misiItems.map((item, i) => (
              <li key={i} className={s.misiItem}>
                {/* Urutan sudah dibawa <ol>; lencana angka hanya tampilan. */}
                <span className={s.misiNumber} aria-hidden="true">{i + 1}</span>
                <p className={s.misiBody}>{item}</p>
              </li>
            ))}
          </ol>
        ) : (
          <div className={`${shared.sections} ${s.misiRich}`}>
            <div className={shared.body} dangerouslySetInnerHTML={{ __html: misi }} />
          </div>
        )}
      </section>
    </div>
  );
}
