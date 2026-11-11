import type { CSSProperties } from 'react';
import { StrukturCard } from './StrukturCard';
import { cardsOf, leafSlot, toneForDepth, type OrgNode } from './struktur.logic';
import { LEAF_COLS } from './struktur.meta';
import s from './struktur-chart.module.css';
import { STRUKTUR_TEXT } from './struktur.text';

type Size = 'lg' | 'md' | 'sm';
type BranchProps = { node: OrgNode; depth: number };

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

/** Kartu sebuah jabatan; jabatan berisi beberapa pegawai → kartu berdampingan di bawah palang kecil. */
function NodeCards({ node, depth, size }: { node: OrgNode; depth: number; size: Size }) {
  const cards = cardsOf(node);
  const tone = toneForDepth(depth);
  if (cards.length === 1) return <StrukturCard item={cards[0]} tone={tone} size={size} />;
  return (
    <div className={s.group} data-branch={node.children.length > 0 || undefined}>
      {cards.map((item) => (
        <div key={item.key} className={s.slot}>
          <StrukturCard item={item} tone={tone} size={size} />
        </div>
      ))}
    </div>
  );
}

/** Bawahan daun: tiap pegawai jadi satu kotak grid, garis induk turun di tengah grid. */
function Leaves({ nodes, depth }: { nodes: readonly OrgNode[]; depth: number }) {
  const items = nodes.flatMap(cardsOf);
  const gridVars = {
    '--c2': leafSlot(0, items.length, LEAF_COLS.base).cols,
    '--c4': leafSlot(0, items.length, LEAF_COLS.wide).cols,
  } as CSSProperties;
  return (
    <ul className={s.leaves} style={gridVars}>
      {items.map((item, index) => (
        <li key={item.key} className={s.branch} style={leafVars(index, items.length)}>
          <StrukturCard item={item} tone={toneForDepth(depth)} size="sm" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Satu cabang: kartu jabatan lalu bawahannya. Bawahan yang punya bawahan → baris berpalang (pola bagan
 * hierarki); bawahan yang semuanya daun → grid beberapa baris dengan garis induk turun di tengah.
 */
function Branch({ node, depth }: BranchProps) {
  const { children } = node;
  const allLeaves = children.length > 0 && children.every((child) => child.children.length === 0);
  return (
    <li className={s.branch}>
      <NodeCards node={node} depth={depth} size={depth === 0 ? 'lg' : 'md'} />
      {allLeaves ? <Leaves nodes={children} depth={depth + 1} /> : null}
      {children.length > 0 && !allLeaves ? (
        <ul className={s.row}>
          {children.map((child) => (
            <Branch key={child.posisiId} node={child} depth={depth + 1} />
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
          <Branch key={node.posisiId} node={node} depth={0} />
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
