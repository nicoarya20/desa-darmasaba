import { IconDownload } from "@tabler/icons-react";
import { APBDES_TEXT } from "../apbdes.text";
import s from "../apbdes.module.css";
import type { APBDes } from "../types/apbdes";

/** Dokumen resmi APBDes tahun terpilih (tombol unduh); tidak tampil bila admin belum mengunggah dokumen. */
export function ApbdesDocument({ apbdes }: { apbdes: APBDes }) {
  const fileUrl = apbdes.file?.link;
  if (!fileUrl) return null;

  return (
    <div className={`${s.panel} ${s.doc}`}>
      <div className={s.docBody}>
        <h3 className={s.panelTitle}>{APBDES_TEXT.documentTitle}</h3>
        {apbdes.name ? <p className={s.docName}>{apbdes.name}</p> : null}
        <a className={s.ctaLink} href={fileUrl} target="_blank" rel="noopener noreferrer">
          <IconDownload size={18} stroke={2} aria-hidden />
          {APBDES_TEXT.download}
        </a>
      </div>
    </div>
  );
}
