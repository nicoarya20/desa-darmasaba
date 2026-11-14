'use client';
import { useRailScroll } from '@/app/(public)/_com/main-page/landing-page/use-rail-scroll';
import { Image } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconPhoto } from '@tabler/icons-react';
import { useState } from 'react';
import { DETAIL_PRODUK_TEXT as T } from './detail-produk.text';
import type { DetailFoto } from './detail-produk.types';
import s from './galeri.module.css';

/** Galeri foto produk: foto utama persegi (maks 480px) + strip thumbnail berpanah bila foto ≥2. Tanpa lightbox/zoom. */
export function ProdukGaleri({ fotos }: { fotos: DetailFoto[] }) {
  const [active, setActive] = useState(0);
  const index = Math.min(active, Math.max(fotos.length - 1, 0));
  const utama = fotos[index];

  return (
    <div className={s.galeri} role="group" aria-label={T.galeriLabel}>
      <div className={s.main}>
        {utama ? (
          <Image src={utama.src} alt={utama.alt} decoding="async" className={s.img} />
        ) : (
          <span className={s.fallback} aria-hidden="true">
            <IconPhoto size={56} stroke={1.5} />
          </span>
        )}
      </div>
      {fotos.length >= 2 && <ThumbStrip fotos={fotos} active={index} onSelect={setActive} />}
    </div>
  );
}

type StripProps = { fotos: DetailFoto[]; active: number; onSelect: (i: number) => void };

function ThumbStrip({ fotos, active, onSelect }: StripProps) {
  const { railRef, state: rail, step } = useRailScroll(fotos.length);

  return (
    <div className={s.stripFrame}>
      <ul ref={railRef} className={s.strip}>
        {fotos.map((foto, i) => (
          <li key={`${foto.src}-${i}`}>
            <button
              type="button"
              className={s.thumb}
              onClick={() => onSelect(i)}
              aria-label={T.fotoKe(i + 1, fotos.length)}
              aria-current={i === active ? 'true' : undefined}
            >
              <Image src={foto.src} alt="" loading="lazy" decoding="async" className={s.img} />
            </button>
          </li>
        ))}
      </ul>
      {rail.canPrev && (
        <button type="button" className={`${s.arrow} ${s.prev}`} onClick={() => step(-1)} aria-label={T.fotoSebelumnya}>
          <IconChevronLeft size={18} stroke={2} aria-hidden="true" />
        </button>
      )}
      {rail.canNext && (
        <button type="button" className={`${s.arrow} ${s.next}`} onClick={() => step(1)} aria-label={T.fotoBerikutnya}>
          <IconChevronRight size={18} stroke={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
