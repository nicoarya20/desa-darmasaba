import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import { Image } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { BEASISWA_HERO_IMAGE, BEASISWA_SYARAT_ID } from './beasiswa.meta';
import s from './beasiswa.module.css';
import { BEASISWA_TEXT as T } from './beasiswa.text';

type Props = { onDaftar: () => void };

/** Kepala halaman: kembali, judul, pengantar, tombol daftar + tautan syarat, foto. */
export function BeasiswaHero({ onDaftar }: Props) {
  return (
    <header className={s.hero}>
      <div className={s.heroText}>
        <BackButton />
        <h1 className={s.title}>{T.title}</h1>
        <p className={s.lead}>{T.lead}</p>
        <div className={s.actions}>
          <button type="button" className={s.pill} onClick={onDaftar} aria-haspopup="dialog">
            {T.daftar}
            <IconArrowRight size={18} stroke={1.75} aria-hidden />
          </button>
          <a className={s.pillSecondary} href={`#${BEASISWA_SYARAT_ID}`}>
            {T.syaratLink}
          </a>
        </div>
      </div>
      <Image
        className={s.photo}
        src={BEASISWA_HERO_IMAGE.src}
        width={BEASISWA_HERO_IMAGE.width}
        height={BEASISWA_HERO_IMAGE.height}
        alt={T.heroAlt}
      />
    </header>
  );
}
