import type { LoadState } from "@/app/(public)/_com/load-once/use-load-once";
import { Skeleton } from "@mantine/core";
import { IconDownload, IconEye, IconFileTypePdf } from "@tabler/icons-react";
import { formatPeriodeDokumen, type JenisDokumen } from "@/lib/dokumen-perencanaan";
import {
  musyawarahDokumen,
  nomorBaris,
  urutkanTahunMenurun,
  type ArahDokumen,
  type ArahDokumenPage,
} from "./arah-kebijakan.logic";
import s from "./arah-kebijakan.module.css";
import { ARAH_TEXT as T, KATEGORI_TEXT } from "./arah-kebijakan.text";

const SKELETON_ROWS = 4;

type Props = {
  kategori: JenisDokumen;
  state: LoadState<ArahDokumenPage>;
  page: number;
  onRetry: () => void;
};

/** Isi panel: memuat → kerangka, gagal → pesan + coba lagi, kosong → satu kalimat, berisi → tabel dokumen. */
export function DokumenTabel({ kategori, state, page, onRetry }: Props) {
  if (state.status === "loading") {
    return (
      <div role="status" aria-busy="true" aria-label={T.loading} className={s.skeleton}>
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <Skeleton key={i} h={56} radius={12} />
        ))}
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className={s.notice} role="alert">
        <p>{T.failed}</p>
        <button type="button" className={s.retry} onClick={onRetry}>
          {T.retry}
        </button>
      </div>
    );
  }
  if (state.data.items.length === 0) return <p className={s.notice}>{KATEGORI_TEXT[kategori].empty}</p>;

  return (
    <table className={s.table} aria-label={T.tableLabel(KATEGORI_TEXT[kategori].title)}>
      <thead>
        <tr>
          <th scope="col" className={s.colNo}>{T.colNo}</th>
          <th scope="col">{T.colNama}</th>
          <th scope="col" className={s.colTahun}>{T.colTahun}</th>
          <th scope="col" className={s.colFile}>{T.colFile}</th>
          <th scope="col" className={s.colAksi}>{T.colAksi}</th>
        </tr>
      </thead>
      <tbody>
        {urutkanTahunMenurun(state.data.items).map((item, index) => (
          <DokumenBaris key={item.id} item={item} nomor={nomorBaris(page, index)} />
        ))}
      </tbody>
    </table>
  );
}

/** Satu baris dokumen: nomor, nama (+ nomor Perdes, musyawarah, ringkasan), tahun, nama berkas, Lihat + Unduh. */
function DokumenBaris({ item, nomor }: { item: ArahDokumen; nomor: number }) {
  const musyawarah = musyawarahDokumen(item);
  const { file } = item;
  return (
    <tr>
      <td className={s.colNo} data-label={T.colNo}>{nomor}</td>
      <td className={s.cellNama}>
        <span className={s.judul}>{item.judul}</span>
        {musyawarah ? <span className={s.meta}>{musyawarah}</span> : null}
        {item.nomorPerdes ? <span className={s.meta}>{T.nomorPerdes(item.nomorPerdes)}</span> : null}
        {item.ringkasan ? <span className={s.ringkasan}>{item.ringkasan}</span> : null}
      </td>
      <td className={s.colTahun} data-label={T.colTahun}>{formatPeriodeDokumen(item)}</td>
      <td className={s.colFile} data-label={T.colFile}>
        {file ? (
          <span className={s.fileName}>
            <IconFileTypePdf size={18} stroke={1.75} aria-hidden />
            <span>{file.realName}</span>
          </span>
        ) : (
          <span className={s.none}>{T.fileKosong}</span>
        )}
      </td>
      <td className={s.colAksi}>
        {file ? (
          <span className={s.aksi}>
            <a
              href={file.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`${s.btn} ${s.btnLight}`}
              aria-label={T.lihatLabel(item.judul)}
            >
              <IconEye size={16} stroke={2} aria-hidden />
              {T.lihat}
            </a>
            <a
              href={file.link}
              download={file.realName}
              className={`${s.btn} ${s.btnPrimary}`}
              aria-label={T.unduhLabel(item.judul)}
            >
              <IconDownload size={16} stroke={2} aria-hidden />
              {T.unduh}
            </a>
          </span>
        ) : (
          <span className={s.none}>{T.aksiKosong}</span>
        )}
      </td>
    </tr>
  );
}
