'use client';
import colors from '@/con/colors';
import { IconBooks, IconExternalLink } from '@tabler/icons-react';
import { useId, type CSSProperties } from 'react';
import BackButton from '../../../pemerintahan/layanan/_com/BackButto';
import { PpidHeader } from '../../../ppid/_com/PpidHeader';
import frame from '../../_com/page-frame/page-frame.module.css';
import s from './perpus-penghubung.module.css';
import type { PerpusWebsiteState } from './perpus-website.logic';
import { websiteHost } from './perpus-website.logic';
import { PERPUS_TEXT as T } from './perpus.text';
import { usePerpusWebsite } from './use-perpus-website';

const BRAND_VARS = { '--brand': colors['blue-button'] } as CSSProperties;

/** Isi panel sesuai keadaan muat; tombol hanya dirender bila URL tersedia. */
export function PerpusPenghubungPanel({ state }: { state: PerpusWebsiteState }) {
  const noteId = useId();

  if (state.status === 'loading') {
    return (
      <div className={`${s.panel} ${s.skeleton}`} role="status" aria-busy="true" aria-label={T.loading}>
        <span className={s.srOnly}>{T.loading}</span>
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <p className={s.message} role="alert">
        {T.error}
      </p>
    );
  }
  if (!state.data) {
    return <p className={s.message}>{T.empty}</p>;
  }

  const { namaPlatform, deskripsi, websiteUrl } = state.data;
  return (
    <section className={s.panel} aria-labelledby={`${noteId}-judul`}>
      <IconBooks className={s.icon} size={40} stroke={1.5} aria-hidden />
      <p className={s.eyebrow}>{T.eyebrow}</p>
      <h2 id={`${noteId}-judul`} className={s.name}>
        {namaPlatform}
      </h2>
      <p className={s.desc}>{deskripsi}</p>
      <a
        className={s.cta}
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-describedby={noteId}
      >
        {T.cta}
        <IconExternalLink size={18} stroke={2} aria-hidden />
      </a>
      <p id={noteId} className={s.note}>
        {T.opensNewTab(websiteHost(websiteUrl))}
      </p>
    </section>
  );
}

/** Halaman penghubung: kerangka Pendidikan, kepala, lalu panel menuju website perpustakaan desa. */
export function PerpusPenghubung() {
  const state = usePerpusWebsite();
  return (
    <div className={`${frame.frame} ${s.page}`} style={BRAND_VARS}>
      <div className={`${frame.inner} ${s.layout}`}>
        <BackButton />
        <PpidHeader title={T.title} lead={T.lead} />
        <PerpusPenghubungPanel state={state} />
      </div>
    </div>
  );
}
