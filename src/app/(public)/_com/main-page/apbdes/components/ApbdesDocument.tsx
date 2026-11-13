import { IconDownload } from "@tabler/icons-react";
import { apbdesDokumenGroups, showGroupTitles } from "@/lib/apbdes-dokumen-groups";
import { APBDES_TEXT } from "../apbdes.text";
import s from "../apbdes.module.css";
import d from "../apbdes.document.module.css";
import type { APBDes } from "../types/apbdes";

/**
 * Dokumen APBDes tahun terpilih per folder ("Umum" dulu, lalu folder), tiap dokumen dengan tombol unduh;
 * tidak tampil bila belum ada dokumen. Data lama tanpa daftar dokumen memakai berkas tunggal `file`.
 */
export function ApbdesDocument({ apbdes }: { apbdes: APBDes }) {
  const groups = apbdesDokumenGroups(apbdes);
  if (groups.length === 0) return null;
  const withTitles = showGroupTitles(groups);

  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>{APBDES_TEXT.documentTitle}</h3>
      <div className={d.groups}>
        {groups.map((group) => (
          <section key={group.key} aria-label={group.nama}>
            {withTitles ? <h4 className={d.groupTitle}>{group.nama}</h4> : null}
            <ul className={d.list}>
              {group.dokumen.map((doc) => (
                <li key={doc.id} className={d.item}>
                  <span className={d.judul}>{doc.judul}</span>
                  <a
                    className={d.download}
                    href={doc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={APBDES_TEXT.downloadLabel(doc.judul)}
                  >
                    <IconDownload size={16} stroke={2} aria-hidden />
                    {APBDES_TEXT.download}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
