import { IconBooks } from '@tabler/icons-react';
import BackButton from '../../../pemerintahan/layanan/_com/BackButto';
import a from './perpus-aksi.module.css';
import s from './perpus-hero.module.css';
import type { PerpusWebsiteState } from './perpus-website.logic';
import { websiteHost } from './perpus-website.logic';
import { PERPUS_CARA_ID } from './perpus.meta';
import { PERPUS_TEXT as T } from './perpus.text';
import { PerpusIlustrasi } from './PerpusIlustrasi';
import { PerpusLink } from './PerpusLink';

/** Blok aksi di kepala: kerangka saat memuat, pesan saat galat/kosong, tombol bila tautan tersedia. */
function Aksi({ state }: { state: PerpusWebsiteState }) {
  if (state.status === 'loading') {
    return <div className={s.skeleton} role="status" aria-busy="true" aria-label={T.loading} />;
  }
  if (state.status === 'error') {
    return (
      <p className={s.message} role="alert">
        {T.error}
      </p>
    );
  }
  if (!state.data) return <p className={s.message}>{T.empty}</p>;

  return (
    <div className={s.actionsBlock}>
      <div className={s.actions}>
        <PerpusLink href={state.data.websiteUrl} />
        <a className={a.pillSecondary} href={`#${PERPUS_CARA_ID}`}>
          {T.caraLink}
        </a>
      </div>
      <p className={a.note}>{T.opensNewTab(websiteHost(state.data.websiteUrl))}</p>
    </div>
  );
}

/** Kepala halaman: kembali, nama platform, judul, pengantar (deskripsi admin), tombol, dan ilustrasi. */
export function PerpusHero({ state }: { state: PerpusWebsiteState }) {
  const data = state.status === 'ready' ? state.data : null;
  return (
    <header className={s.hero}>
      <div className={s.heroText}>
        <BackButton />
        {data ? (
          <span className={s.eyebrow}>
            <IconBooks size={18} stroke={1.75} aria-hidden />
            <span className={s.eyebrowText}>{data.namaPlatform}</span>
          </span>
        ) : null}
        <h1 className={s.title}>{T.title}</h1>
        <p className={s.lead}>{data?.deskripsi ?? T.lead}</p>
        <Aksi state={state} />
      </div>
      <PerpusIlustrasi host={data ? websiteHost(data.websiteUrl) : null} />
    </header>
  );
}
