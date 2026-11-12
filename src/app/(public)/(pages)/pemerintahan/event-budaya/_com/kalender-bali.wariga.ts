// Wariga lengkap satu hari untuk modal hari: wewaran (eka–dasa wara), pawukon, dan sasih. Hanya nama &
// angka dari hitungan pustaka — tanpa tafsir baik/buruk (dewasa ayu).
import { BalineseDate } from 'balinese-date-js-lib';
import { dateUntukPustaka, ejaanTampil } from './kalender-bali.logic';

export type BarisWariga = { label: string; nilai: string };
export type KelompokWariga = { judul: string; baris: BarisWariga[] };

const KOSONG = '—';
const nama = (v: { name: string }) => (v.name ? ejaanTampil(v.name) : KOSONG);

/** "Penanggal 3", "Pangelong 14/15" (ngunaratri), "Purnama (penanggal 15)", "Tilem (pangelong 15)". */
function hariSasih(bd: BalineseDate): string {
  const ke = bd.sasihDay.join('/');
  const info = bd.sasihDayInfo.name;
  if (info === 'Purnama') return `Purnama (penanggal ${ke})`;
  if (info === 'Tilem') return `Tilem (pangelong ${ke})`;
  return `${info} ${ke}`;
}

/** Rincian wariga satu hari kalender (nomor hari WITA), dikelompokkan untuk ditampilkan berderet. */
export function warigaHari(hari: number): KelompokWariga[] {
  const bd = new BalineseDate(dateUntukPustaka(hari));
  return [
    {
      judul: 'Wewaran',
      baris: [
        { label: 'Ekawara', nilai: nama(bd.ekaWara) },
        { label: 'Dwiwara', nilai: nama(bd.dwiWara) },
        { label: 'Triwara', nilai: nama(bd.triWara) },
        { label: 'Caturwara', nilai: nama(bd.caturWara) },
        { label: 'Pancawara', nilai: nama(bd.pancaWara) },
        { label: 'Sadwara', nilai: nama(bd.sadWara) },
        { label: 'Saptawara', nilai: nama(bd.saptaWara) },
        { label: 'Astawara', nilai: nama(bd.astaWara) },
        { label: 'Sangawara', nilai: nama(bd.sangaWara) },
        { label: 'Dasawara', nilai: nama(bd.dasaWara) },
      ],
    },
    {
      judul: 'Pawukon',
      baris: [
        { label: 'Wuku', nilai: `${nama(bd.wuku)} (urip ${bd.wuku.urip})` },
        { label: 'Ingkel', nilai: nama(bd.ingkel) },
        { label: 'Jejepan', nilai: nama(bd.jejepan) },
        { label: 'Lintang', nilai: nama(bd.lintang) },
        { label: 'Pancasuda', nilai: nama(bd.pancaSuda) },
        { label: 'Pararasan', nilai: nama(bd.pararasan) },
        { label: 'Rakam', nilai: nama(bd.rakam) },
        { label: 'Watek Alit', nilai: nama(bd.watekAlit) },
        { label: 'Watek Madya', nilai: nama(bd.watekMadya) },
        { label: 'Eka Jala Rsi', nilai: nama(bd.ekaJalaRsi) },
        { label: 'Pratithi Samut Pada', nilai: nama(bd.pratithiSamutPada) },
      ],
    },
    {
      judul: 'Sasih',
      baris: [
        { label: 'Sasih', nilai: nama(bd.sasih) },
        { label: 'Hari sasih', nilai: hariSasih(bd) },
        { label: 'Tahun Çaka', nilai: String(bd.saka) },
      ],
    },
  ];
}
