import type { CSSProperties } from 'react';
import { StrukturCard } from './StrukturCard';
import { leafSlot, toneForDepth, type OrgNode } from './struktur.logic';
import { LEAF_COLS } from './struktur.meta';
import s from './struktur-chart.module.css';
import { STRUKTUR_TEXT } from './struktur.text';

type BranchProps = { node: OrgNode; depth: number; inLeaves: boolean; style?: CSSProperties };

/** Variabel CSS posisi kotak daun untuk kedua batas kolom (laptop / layar lebar). */
function leafVars(index: number, count: number): CSSProperties {
  const base = leafSlot(index, count, LEAF_COLS.base);
  const wide = leafSlot(index, count, LEAF_COLS.wide);
  return {
    '--o2': base.offset,
    '--a2': Math.abs(base.offset),
    '--s2': base.shift,
    '--o4': wide.offset,
    '--a4': Math.abs(wide.offset),
    '--s4': wide.shift,
  } as CSSProperties;
}

/**
 * Satu cabang: kartu jabatan lalu bawahannya. Bawahan yang punya bawahan → baris berpalang (pola bagan
 * hierarki); bawahan yang semuanya daun → grid beberapa baris dengan garis induk turun di tengah.
 */
function Branch({ node, depth, inLeaves, style }: BranchProps) {
  const { children } = node;
  const leaves = children.length > 0 && children.every((child) => child.children.length === 0);
  const gridVars = {
    '--c2': leafSlot(0, children.length, LEAF_COLS.base).cols,
    '--c4': leafSlot(0, children.length, LEAF_COLS.wide).cols,
  } as CSSProperties;
  return (
    <li className={s.branch} style={style}>
      <StrukturCard node={node} tone={toneForDepth(depth)} size={depth === 0 ? 'lg' : inLeaves ? 'sm' : 'md'} />
      {children.length > 0 ? (
        <ul className={leaves ? s.leaves : s.row} style={leaves ? gridVars : undefined}>
          {children.map((child, index) => (
            <Branch
              key={child.posisiId}
              node={child}
              depth={depth + 1}
              inLeaves={leaves}
              style={leaves ? leafVars(index, children.length) : undefined}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Bagan struktur PPID sebagai daftar bersarang; meluber → geser horizontal, ≤1068px → tumpukan. */
export function StrukturChart({ roots }: { roots: readonly OrgNode[] }) {
  return (
    <div className={s.chart}>
      <ul className={s.roots} aria-label={STRUKTUR_TEXT.chartLabel}>
        {roots.map((node) => (
          <Branch key={node.posisiId} node={node} depth={0} inLeaves={false} />
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
