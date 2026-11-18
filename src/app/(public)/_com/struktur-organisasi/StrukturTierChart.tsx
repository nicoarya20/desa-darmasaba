import { StrukturCard } from './StrukturCard';
import { cardsOf, toneForDepth, type OrgNode } from './struktur.logic';
import type { TierBand, TierPlacement } from './struktur-tiers.logic';
import c from './struktur-chart.module.css';
import s from './struktur-tiers.module.css';

type HrefFor = (pegawaiId: string) => string;

/** Satu klaster: kartu kepala (bila ada) lalu kartu bawahan berpalang. */
function TierUnitItem({ placement, hrefFor }: { placement: TierPlacement; hrefFor: HrefFor }) {
  const { unit, side, lower } = placement;
  const headed = unit.head.length > 0;
  return (
    <li className={s.unit} data-side={side} data-lower={lower || undefined} data-head={headed || undefined}>
      {headed ? (
        <div className={s.head}>
          {unit.head.map((item) => (
            <StrukturCard key={item.key} item={item} tone={toneForDepth(1)} size="xs" hrefFor={hrefFor} />
          ))}
        </div>
      ) : null}
      <ul className={s.cluster}>
        {unit.cards.map((item) => (
          <li key={item.key} className={s.slot}>
            <StrukturCard item={item} tone={toneForDepth(headed ? 2 : 1)} size="xs" hrefFor={hrefFor} />
          </li>
        ))}
      </ul>
    </li>
  );
}

type Props = {
  root: OrgNode;
  /** Rencana band dari `planTierBands(root)`. */
  bands: readonly TierBand[];
  label: string;
  hrefFor: HrefFor;
};

/**
 * Bagan bertingkat (Perangkat Desa): kartu akar, lalu satu batang tegak dengan klaster ≤3 kartu di kiri/kanan
 * per band (aturan susun di `struktur-tiers.logic.ts`). Lebar isi menentukan mode (struktur-tiers.module.css):
 * batang tengah dua sisi, rel kiri klaster berjajar, atau rel kiri bertumpuk; tanpa geser horizontal.
 * Tiap band = satu daftar klaster (urut pangkat) agar pembaca layar membaca dari atas ke bawah.
 */
export function StrukturTierChart({ root, bands, label, hrefFor }: Props) {
  return (
    <div className={`${c.chart} ${s.tiers}`}>
      <ul className={s.roots} aria-label={label}>
        <li className={s.root}>
          <div className={s.rootCards}>
            {cardsOf(root).map((item) => (
              <StrukturCard key={item.key} item={item} tone={toneForDepth(0)} size="lg" hrefFor={hrefFor} fullName />
            ))}
          </div>
          {bands.map((band) => (
            <ul key={band.key} className={s.band}>
              {band.units.map((placement) => (
                <TierUnitItem key={placement.unit.key} placement={placement} hrefFor={hrefFor} />
              ))}
            </ul>
          ))}
        </li>
      </ul>
    </div>
  );
}
