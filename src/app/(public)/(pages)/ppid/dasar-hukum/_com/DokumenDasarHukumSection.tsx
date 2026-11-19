import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { IconDownload, IconEye } from '@tabler/icons-react';
import type { DokumenDasarHukum } from '@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dokumenDasarHukum';
import l from '../../_com/ppid-file-link.module.css';
import s from '../../_com/ppid-sections.module.css';
import f from './dasar-hukum.module.css';
import { DASAR_HUKUM_TEXT as T } from './dasar-hukum.text';

type Props = { items: readonly DokumenDasarHukum[] };

/**
 * Bagian "Dokumen Dasar Hukum": daftar PDF berurut dengan tautan "Lihat" (tab baru; server melayani PDF inline, jadi
 * terbaca di browser) dan "Unduh" (atribut `download` pada tautan satu-asal: simpan sebagai berkas bernama aslinya).
 * Tidak merender apa pun bila belum ada dokumen.
 */
export function DokumenDasarHukumSection({ items }: Props) {
  if (items.length === 0) return null;
  return (
    <section className={s.section} aria-labelledby="ppid-dokumen-dasar-hukum">
      <h2 id="ppid-dokumen-dasar-hukum" className={s.sectionLabel}>{T.dokumenTitle}</h2>
      <ul className={f.dokumen}>
        {items.map((item) => (
          <li key={item.id} className={f.dokumenItem}>
            <span className={f.dokumenJudul}>{item.judul}</span>
            <span className={f.dokumenAksi}>
              <a
                href={item.file.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`${l.link} ${r.trigger}`}
                aria-label={T.lihatLabel(item.judul)}
              >
                <IconEye size={16} stroke={2} aria-hidden />
                <span className={r.cta} data-text={T.lihat}>{T.lihat}</span>
              </a>
              <a
                href={item.file.link}
                download={item.file.realName}
                className={`${l.link} ${r.trigger}`}
                aria-label={T.unduhLabel(item.judul)}
              >
                <IconDownload size={16} stroke={2} aria-hidden />
                <span className={r.cta} data-text={T.unduh}>{T.unduh}</span>
              </a>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
