import { banjarLabel, formatHitungan, type BanjarStatsRow, type PosyanduStats } from "./posyandu.logic";
import { POSYANDU_TEXT as T } from "./posyandu.text";
import { BanjarStatsPanel, type BanjarStatsData } from "./BanjarStatsPanel";
import type { LoadState } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import r from "./posyandu-rows.module.css";

type Props = { desa: LoadState<PosyanduStats>; banjar: LoadState<BanjarStatsRow[]>; onRetry: () => void };

/** Tab Ibu Hamil: ubin jumlah ibu hamil aktif per banjar (tanpa nama), ubin pertama = seluruh desa. */
export function IbuHamilPanel(props: Props) {
  return (
    <BanjarStatsPanel titleId="posyandu-ibu-hamil-title" title={T.ibuHamilTitle} lead={T.ibuHamilLead} unassignedKey="ibuHamilAktif" {...props}>
      {(data) => <IbuHamilTiles {...data} />}
    </BanjarStatsPanel>
  );
}

/** Ubin per banjar (dipisah agar bisa dites tanpa memuat data). */
export function IbuHamilTiles({ desa, rows }: BanjarStatsData) {
  return (
    <ul className={r.tiles}>
      <Tile name={T.desaRow} value={desa?.ibuHamilAktif ?? null} total />
      {rows.map((row) => (
        <Tile key={row.id} name={banjarLabel(row.name)} value={row.stats?.ibuHamilAktif ?? null} />
      ))}
    </ul>
  );
}

function Tile({ name, value, total }: { name: string; value: number | null; total?: boolean }) {
  return (
    <li className={`${r.tile} ${total ? r.tileTotal : ""}`}>
      <span className={r.tileName}>{name}</span>
      {value === null ? (
        <span className={`${r.tileValue} ${r.tileFailed}`}>{T.rowFailed}</span>
      ) : (
        <span className={r.tileValue}>
          {formatHitungan(value)}
          <span className={r.tileUnit}>{T.orangUnit}</span>
        </span>
      )}
    </li>
  );
}
