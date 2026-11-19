import { formatJumlah } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { BarChart } from '@mantine/charts';
// CSS grafik diimpor di pemakai, bukan globals.css: tidak lagi render-blocking di halaman tanpa grafik.
import '@mantine/charts/styles.css';
import { useMediaQuery } from '@mantine/hooks';
import { BULAN, type PengangguranBulan } from './pengangguran.logic';
import { SERI_WARNA } from './pengangguran.meta';
import { PENGANGGURAN_TEXT as T } from './pengangguran.text';

const SERIES = [
  { name: 'terdidik', label: T.jumlah.terdidik, color: SERI_WARNA.terdidik },
  { name: 'tidakTerdidik', label: T.jumlah.tidakTerdidik, color: SERI_WARNA.tidakTerdidik },
];

/**
 * Batang bertumpuk per bulan satu tahun (terdidik + tidak terdidik = jumlah). Sumbu selalu Jan–Des agar bulan yang
 * belum dicatat terlihat sebagai celah, bukan batang yang merenggang; semua label bulan tampil, juga di ponsel.
 */
export function PengangguranChart({ bulan }: { bulan: readonly PengangguranBulan[] }) {
  // Ponsel: 12 label bulan harus muat di ±260px plot, jadi huruf sumbu dikecilkan (bukan melompati bulan).
  const compact = useMediaQuery('(max-width: 734px)');
  const byIndex = new Map(bulan.map((b) => [b.bulan, b]));
  const data = BULAN.map((nama, i) => {
    const b = byIndex.get(i);
    return { bulan: nama, terdidik: b?.terdidik ?? null, tidakTerdidik: b?.tidakTerdidik ?? null };
  });

  return (
    <BarChart
      h={300}
      data={data}
      dataKey="bulan"
      type="stacked"
      series={SERIES}
      withLegend
      legendProps={{ verticalAlign: 'top', height: 44 }}
      valueFormatter={formatJumlah}
      xAxisProps={{ interval: 0, tick: { fontSize: compact ? 10 : 12 } }}
      yAxisProps={{ allowDecimals: false, width: compact ? 32 : 44, tickFormatter: formatJumlah }}
      gridAxis="x"
      tickLine="none"
      maxBarWidth={48}
    />
  );
}
