import type { Icon } from '@tabler/icons-react';
import s from './detail-section.module.css';
import type { RichText } from './lowongan-detail.types';

type Props = { title: string; icon: Icon; body: RichText };

/** Satu bagian isi kartu (Deskripsi pekerjaan / Kualifikasi): ubin ikon + `h2`, lalu teks kaya. */
export function DetailSection({ title, icon: SectionIcon, body }: Props) {
  return (
    <section className={s.section}>
      <h2 className={s.sectionTitle}>
        <span className={s.sectionIcon} aria-hidden="true">
          <SectionIcon size={22} stroke={1.75} />
        </span>
        {title}
      </h2>
      <RichTextBody body={body} />
    </section>
  );
}

/** HTML sudah disanitasi adapter (`toRichText` → sanitizeRichText); teks polos dirender React per paragraf. */
function RichTextBody({ body }: { body: RichText }) {
  if (body.kind === 'html') {
    return <div className={s.rich} dangerouslySetInnerHTML={{ __html: body.html }} />;
  }
  return (
    <div className={s.rich}>
      {body.paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}
