import { StrukturCard } from './StrukturCard';
import { toneForDepth, type OrgNode } from './struktur.logic';
import s from './struktur-chart.module.css';
import { STRUKTUR_TEXT } from './struktur.text';

type BranchProps = { node: OrgNode; depth: number; inStack: boolean };

/** Satu cabang: kartu jabatan lalu bawahannya — baris bergaris atas, atau tumpukan berel kiri bila semuanya daun. */
function Branch({ node, depth, inStack }: BranchProps) {
  const { children } = node;
  const stacked = children.length > 0 && children.every((child) => child.children.length === 0);
  return (
    <li className={s.branch}>
      <StrukturCard node={node} tone={toneForDepth(depth)} size={depth === 0 ? 'lg' : inStack ? 'sm' : 'md'} />
      {children.length > 0 ? (
        <ul className={stacked ? s.stack : s.row}>
          {children.map((child) => (
            <Branch key={child.posisiId} node={child} depth={depth + 1} inStack={stacked} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Bagan struktur PPID sebagai daftar bersarang; meluber → geser horizontal, mobile → tumpukan. */
export function StrukturChart({ roots }: { roots: readonly OrgNode[] }) {
  return (
    <div className={s.chart}>
      <ul className={s.roots} aria-label={STRUKTUR_TEXT.chartLabel}>
        {roots.map((node) => (
          <Branch key={node.posisiId} node={node} depth={0} inStack={false} />
        ))}
      </ul>
    </div>
  );
}

/** Kerangka bagan selama data dimuat. */
export function StrukturChartSkeleton() {
  return (
    <div className={s.skeleton} role="status" aria-label={STRUKTUR_TEXT.loading}>
      <span className={s.skeletonCard} data-size="lg" />
      <span className={s.skeletonRow}>
        <span className={s.skeletonCard} />
        <span className={s.skeletonCard} />
      </span>
    </div>
  );
}
