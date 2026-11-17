import { PpidFileLink, type PpidFile } from '../../_com/PpidFileLink';
import s from '../../_com/ppid-sections.module.css';
import { DasarHukumList } from './DasarHukumList';
import { parseDasarHukumItems } from './dasar-hukum.logic';
import f from './dasar-hukum.module.css';

type Props = {
  data: { judul: string; content: string; file?: PpidFile | null };
};

/** Bagian Dasar Hukum: subjudul, daftar peraturan (atau isi apa adanya), dan tautan "Unduh PDF" bila ada berkas. */
export function DasarHukumSection({ data }: Props) {
  // Isi yang bukan satu daftar teks polos (null) dirender apa adanya agar tidak ada yang hilang.
  const items = parseDasarHukumItems(data.content);
  return (
    <section className={s.section} aria-labelledby="ppid-dasar-hukum">
      <h2 id="ppid-dasar-hukum" className={s.sectionLabel} dangerouslySetInnerHTML={{ __html: data.judul }} />
      {items ? (
        <DasarHukumList items={items} />
      ) : (
        <div className={s.body} dangerouslySetInnerHTML={{ __html: data.content }} />
      )}
      {data.file && (
        <div className={f.unduh}>
          <PpidFileLink file={data.file} />
        </div>
      )}
    </section>
  );
}
