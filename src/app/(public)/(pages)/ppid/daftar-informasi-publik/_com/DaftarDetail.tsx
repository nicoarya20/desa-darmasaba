import { PpidFileLink } from '../../_com/PpidFileLink';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import { formatTanggal, type InformasiItem } from './daftar.logic';
import s from './daftar.module.css';
import { DAFTAR_TEXT } from './daftar.text';

/** Isi detail satu informasi publik: jenis, tanggal publikasi, deskripsi lengkap, dan "Unduh PDF" bila ada berkas. */
export function DaftarDetail({ data }: { data: InformasiItem }) {
  return (
    <dl className={s.detail}>
      <div>
        <dt className={s.detailTerm}>{DAFTAR_TEXT.columns.jenis}</dt>
        <dd className={`${s.detailValue} ${s.detailJenis}`}>{data.jenisInformasi || DAFTAR_TEXT.emptyValue}</dd>
      </div>
      <div>
        <dt className={s.detailTerm}>{DAFTAR_TEXT.columns.tanggal}</dt>
        <dd className={s.detailValue}>{formatTanggal(data.tanggal, DAFTAR_TEXT.emptyValue)}</dd>
      </div>
      <div>
        <dt className={s.detailTerm}>{DAFTAR_TEXT.columns.deskripsi}</dt>
        <dd className={`${s.detailValue} ${rt.root}`} dangerouslySetInnerHTML={{ __html: data.deskripsi || DAFTAR_TEXT.emptyValue }} />
      </div>
      {data.file && (
        <div>
          <dt className={s.detailTerm}>{DAFTAR_TEXT.detailBerkas}</dt>
          <dd className={s.detailValue}>
            <PpidFileLink file={data.file} subject={data.jenisInformasi} />
          </dd>
        </div>
      )}
    </dl>
  );
}
