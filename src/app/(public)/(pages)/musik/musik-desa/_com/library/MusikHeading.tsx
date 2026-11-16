import s from './musik-heading.module.css';

/** Judul halaman (h1) + paragraf pengantar opsional, dipakai Musik/Jelajahi/Playlist. */
export function MusikHeading({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className={s.head}>
      <h1 className={s.title}>{title}</h1>
      {lead ? <p className={s.lead}>{lead}</p> : null}
    </header>
  );
}
