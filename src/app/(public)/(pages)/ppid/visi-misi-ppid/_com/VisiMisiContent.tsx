import { Image } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { useId } from 'react';
import { parsePlainListItems } from '../../_com/cms-list.logic';
import shared from '../../_com/ppid-sections.module.css';
import s from './visi-misi.module.css';

/** Lambang desa di kepala kartu. */
const LOGO_SRC = '/darmasaba-icon.png';

type Props = {
  /** HTML visi dari editor admin. */
  visi: string;
  /** HTML misi dari editor admin; satu daftar teks polos tampil sebagai butir bernomor. */
  misi: string;
  /** Judul bagian dan teks alternatif lambang — tiap halaman punya sebutannya sendiri (PPID / Desa). */
  labels: { visi: string; misi: string; logoAlt: string };
  /** Moto di bawah lambang (opsional): judul + kalimat moto. Tanpa moto, lambang langsung di atas visi. */
  moto?: { title: string; statement: string };
};

/** Pemisah antarbagian: dua garis pendek mengapit ornamen. */
function Ornament() {
  return (
    <div className={s.ornament} aria-hidden="true">
      <IconSparkles size={18} stroke={1.5} />
    </div>
  );
}

/**
 * Kartu Visi dan Misi: satu kartu terpusat berisi lambang desa, moto (opsional), visi, dan misi.
 * Dipakai halaman Visi Misi PPID dan section Visi Misi di Profil Desa.
 */
export function VisiMisiContent({ visi, misi, labels, moto }: Props) {
  const id = useId();
  // Isi yang bukan satu daftar teks polos (null) dirender apa adanya agar tidak ada yang hilang.
  const misiItems = parsePlainListItems(misi);
  const logo = <Image className={s.logo} src={LOGO_SRC} alt={labels.logoAlt} />;

  return (
    <div className={s.card}>
      {moto ? (
        <>
          <section className={s.section} aria-labelledby={`${id}-moto`}>
            {logo}
            <h2 id={`${id}-moto`} className={s.motoTitle}>{moto.title}</h2>
            <p className={s.motoText}>{moto.statement}</p>
          </section>
          <Ornament />
        </>
      ) : null}

      <section className={s.section} aria-labelledby={`${id}-visi`}>
        {moto ? null : logo}
        <h2 id={`${id}-visi`} className={s.title}>{labels.visi}</h2>
        <div className={s.visiText} dangerouslySetInnerHTML={{ __html: visi }} />
      </section>

      <Ornament />

      <section className={s.section} aria-labelledby={`${id}-misi`}>
        <h2 id={`${id}-misi`} className={s.title}>{labels.misi}</h2>
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
