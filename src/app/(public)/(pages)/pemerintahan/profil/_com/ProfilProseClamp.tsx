'use client'
import { IconChevronDown } from '@tabler/icons-react';
import { useId, useRef, useState } from 'react';
import { ProfilProse } from './ProfilCard';
import { preferredScrollBehavior } from './profil.scroll';
import { PROFIL_TEXT } from './profil.text';
import p from './profil-prose.module.css';

const T = PROFIL_TEXT.prose;

/** Teks panjang tanpa sub-judul: awalnya terpotong dengan pudar di bawah, tombol membuka seluruh teks. */
export function ProfilProseClamp({ html }: { html: string }) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const boxRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    setOpen(!open);
    // Saat menutup, kembali ke awal teks supaya pembaca tidak tertinggal di tengah halaman yang menyusut.
    if (open) boxRef.current?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
  };

  return (
    <div className={p.clampRoot}>
      <div ref={boxRef} id={bodyId} className={open ? p.clampBox : `${p.clampBox} ${p.clamped}`}>
        <ProfilProse html={html} />
      </div>
      <button type="button" className={p.toggle} aria-expanded={open} aria-controls={bodyId} onClick={toggle}>
        {open ? T.less : T.more}
        <IconChevronDown className={p.toggleIcon} aria-hidden />
      </button>
    </div>
  );
}
