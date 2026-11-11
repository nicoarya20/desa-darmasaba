import type { CSSProperties } from 'react';
import { StrukturCard } from './StrukturCard';
import { cardsOf, leafSlot, toneForDepth, type OrgNode } from './struktur.logic';
import { LEAF_COLS } from './struktur.meta';
import s from './struktur-chart.module.css';
import { STRUKTUR_TEXT } from './struktur.text';

type Size = 'lg' | 'md' | 'sm';
type HrefFor = (pegawaiId: string) => string;
type BranchProps = { node: OrgNode; depth: number; hrefFor: HrefFor };

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
function NodeCards({ node, depth, size, hrefFor }: BranchProps & { size: Size }) {
  const cards = cardsOf(node);
  const tone = toneForDepth(depth);
  if (cards.length === 1) return <StrukturCard item={cards[0]} tone={tone} size={size} hrefFor={hrefFor} />;
  return (
    <div className={s.group} data-branch={node.children.length > 0 || undefined}>
      {cards.map((item) => (
        <div key={item.key} className={s.slot}>
          <StrukturCard item={item} tone={tone} size={size} hrefFor={hrefFor} />
        </div>
      ))}
    </div>
  );
}

/** Bawahan daun: tiap pegawai jadi satu kotak grid, garis induk turun di tengah grid. */
function Leaves({ nodes, depth, hrefFor }: { nodes: readonly OrgNode[]; depth: number; hrefFor: HrefFor }) {
  const items = nodes.flatMap(cardsOf);
  const gridVars = {
    '--c2': leafSlot(0, items.length, LEAF_COLS.base).cols,
    '--c4': leafSlot(0, items.length, LEAF_COLS.wide).cols,
  } as CSSProperties;
  return (
    <ul className={s.leaves} style={gridVars}>
      {items.map((item, index) => (
        <li key={item.key} className={s.branch} style={leafVars(index, items.length)}>
          <StrukturCard item={item} tone={toneForDepth(depth)} size="sm" hrefFor={hrefFor} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Satu cabang: kartu jabatan lalu bawahannya. Bawahan yang punya bawahan → baris berpalang (pola bagan
 * hierarki); bawahan yang semuanya daun → grid beberapa baris dengan garis induk turun di tengah.
 */
function Branch({ node, depth, hrefFor }: BranchProps) {
  const { children } = node;
  const allLeaves = children.length > 0 && children.every((child) => child.children.length === 0);
  return (
    <li className={s.branch}>
      <NodeCards node={node} depth={depth} size={depth === 0 ? 'lg' : 'md'} hrefFor={hrefFor} />
      {allLeaves ? <Leaves nodes={children} depth={depth + 1} hrefFor={hrefFor} /> : null}
      {children.length > 0 && !allLeaves ? (
        <ul className={s.row}>
          {children.map((child) => (
            <Branch key={child.posisiId} node={child} depth={depth + 1} hrefFor={hrefFor} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

type ChartProps = {
  roots: readonly OrgNode[];
  /** Nama bagan untuk pembaca layar (mis. "Bagan struktur organisasi PPID"). */
  label: string;
  /** Rute profil pegawai yang dituju kartu. */
  hrefFor: HrefFor;
};

/**
 * Bagan struktur organisasi sebagai daftar bersarang; meluber → geser horizontal, ≤1068px → tumpukan.
 * Dipakai Struktur PPID dan Struktur Perangkat Desa (data pegawai yang sama, rute profil berbeda).
 */
export function StrukturChart({ roots, label, hrefFor }: ChartProps) {
  return (
    <div className={s.chart}>
      <ul className={s.roots} aria-label={label}>
        {roots.map((node) => (
          <Branch key={node.posisiId} node={node} depth={0} hrefFor={hrefFor} />
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
