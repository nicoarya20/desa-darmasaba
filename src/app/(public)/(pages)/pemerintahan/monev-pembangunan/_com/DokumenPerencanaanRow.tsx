import type { DokumenPerencanaanItem } from "@/app/admin/(dashboard)/_state/desa/dokumenPerencanaan";
import { JENIS_MUSYAWARAH_LABEL, formatPeriodeDokumen, isJenisMusyawarah } from "@/lib/dokumen-perencanaan";
import { IconDownload, IconEye, IconFileText } from "@tabler/icons-react";
import r from "./monev-rows.module.css";
import { MONEV_TEXT } from "./monev.text";

/** Baris satu dokumen perencanaan: periode/musyawarah, judul, nomor Perdes, ringkasan, Lihat/Unduh PDF. */
export function DokumenPerencanaanRow({ item }: { item: DokumenPerencanaanItem }) {
  const musyawarah = isJenisMusyawarah(item.jenisMusyawarah) ? JENIS_MUSYAWARAH_LABEL[item.jenisMusyawarah] : null;
  const meta = [formatPeriodeDokumen(item), musyawarah].filter(Boolean).join(" · ");

  return (
    <li className={r.docRow}>
      <span className={r.docIcon} aria-hidden>
        <IconFileText size={22} stroke={1.75} />
      </span>
      <div className={r.docMain}>
        <p className={r.docMeta}>{meta}</p>
        <h3 className={r.docTitle}>{item.judul}</h3>
        {item.nomorPerdes ? <p className={r.docNomor}>{MONEV_TEXT.docNomorPerdes(item.nomorPerdes)}</p> : null}
        {item.ringkasan ? <p className={r.docRingkasan}>{item.ringkasan}</p> : null}
      </div>
      <div className={r.docActions}>
        {item.file ? (
          <>
            <a className={r.pillButton} href={item.file.link} target="_blank" rel="noreferrer">
              <IconEye size={16} stroke={2} aria-hidden />
              {MONEV_TEXT.docView}
            </a>
            <a className={r.pillPrimary} href={item.file.link} download={item.file.realName}>
              <IconDownload size={16} stroke={2} aria-hidden />
              {MONEV_TEXT.docDownload}
            </a>
          </>
        ) : (
          <p className={r.docNoFile}>{MONEV_TEXT.docNoFile}</p>
        )}
      </div>
    </li>
  );
}
