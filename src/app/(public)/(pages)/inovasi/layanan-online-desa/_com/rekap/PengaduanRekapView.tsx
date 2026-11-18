import { isRekapKosong, type PengaduanRekap } from '@/lib/pengaduan-rekap';
import { PENGADUAN_STATUS_LABEL } from '@/lib/pengaduan-status';
import { formatTanggalTanggapan, statusCards } from './rekap.logic';
import s from './rekap.module.css';
import { PENGADUAN_REKAP_TEXT as T } from './rekap.text';

/** Isi rekap yang sudah dimuat: kartu angka per status + tanggapan terbaru; kosong → satu kalimat sopan, bukan "0". */
export function PengaduanRekapView({ rekap }: { rekap: PengaduanRekap }) {
  if (isRekapKosong(rekap)) return <p className={s.empty}>{T.empty}</p>;

  return (
    <>
      <ul className={s.stats} aria-label={T.statsLabel}>
        {statusCards(rekap).map((card) => (
          <li key={card.status} className={s.stat}>
            <span className={s.statNumber}>{card.jumlah}</span>
            <span className={s.statLabel}>{card.label}</span>
          </li>
        ))}
      </ul>
      <p className={s.total}>{T.total(rekap.total)}</p>

      {rekap.tanggapanTerbaru.length === 0 ? (
        <p className={s.empty}>{T.noTanggapan}</p>
      ) : (
        <>
          <h3 className={s.listTitle}>{T.listTitle}</h3>
          <ol className={s.list} aria-label={T.listLabel}>
            {rekap.tanggapanTerbaru.map((item, index) => {
              const tanggal = formatTanggalTanggapan(item.tanggapanAt);
              return (
                <li key={`${item.tanggapanAt ?? 'tanpa-tanggal'}-${index}`} className={s.item}>
                  <p className={s.meta}>
                    <span className={s.jenis}>{item.jenis}</span>
                    <span className={s.pill}>{PENGADUAN_STATUS_LABEL[item.status]}</span>
                    {tanggal ? <time dateTime={item.tanggapanAt ?? undefined}>{tanggal}</time> : null}
                  </p>
                  <p className={s.tanggapan}>{item.tanggapan}</p>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </>
  );
}
