import Link from "next/link";
import r from "../../link-reveal/link-reveal.module.css";
import { SkeletonText } from "../../skeleton-text/SkeletonText";
import { AntiKorupsiItem } from "./AntiKorupsiItem";
import type { AntiKorupsiGroup, AntiKorupsiIndicator } from "./desaantikorupsi.logic";
import { ANTIKORUPSI_SKELETON_CHARS, ANTIKORUPSI_SKELETON_GROUPS } from "./desaantikorupsi.meta";
import s from "./desaantikorupsi.module.css";
import { ANTIKORUPSI_TEXT } from "./desaantikorupsi.text";

type AntiKorupsiGroupsProps = {
  groups: readonly AntiKorupsiGroup[];
  loading: boolean;
  /** Opsional: tiap butir jadi tautan (halaman utama DAK). Tanpa prop ini butir teks biasa (beranda). */
  itemHref?: (item: AntiKorupsiIndicator) => string;
  /** Opsional: nama kategori jadi tautan + petunjuk "Lihat dokumen". */
  kategoriHref?: (group: AntiKorupsiGroup) => string;
};

/** Judul grup: teks biasa, atau tautan ke dokumen kategori bila `href` diberikan. */
function GroupTitle({ group, headingId, href }: { group: AntiKorupsiGroup; headingId: string; href?: string }) {
  if (!href) {
    return (
      <h3 id={headingId} className={s.groupTitle}>
        {group.name}
      </h3>
    );
  }
  return (
    <h3 className={s.groupTitle}>
      <Link href={href} className={`${s.groupLink} ${r.trigger}`}>
        <span id={headingId}>
          <span className={r.title}>{group.name}</span>
        </span>
        <span className={s.groupHint}>
          <span className={r.cta} data-text={ANTIKORUPSI_TEXT.lihatDokumen}>
            {ANTIKORUPSI_TEXT.lihatDokumen}
          </span>{" "}
          <span className={`${s.groupArrow} ${r.chevron}`} aria-hidden>
            →
          </span>
        </span>
      </Link>
    </h3>
  );
}

/**
 * Kerangka panel selama memuat: grup, judul kategori, dan butir bernomor memakai kelas yang sama dengan isi asli
 * (teks contoh tak terlihat di slot teks), jadi tingginya mengikuti isi di tiap lebar layar dan section di bawahnya
 * tidak bergeser saat data tiba.
 */
function AntiKorupsiGroupsSkeleton() {
  return (
    <div className={s.panel} aria-hidden>
      {ANTIKORUPSI_SKELETON_GROUPS.map((itemChars, g) => (
        <div key={g} className={s.group}>
          <div className={s.groupTitle}>
            <SkeletonText chars={ANTIKORUPSI_SKELETON_CHARS.kategori} />
          </div>
          <ul className={s.list}>
            {itemChars.map((chars, i) => (
              <li key={i} className={s.item}>
                <span className={s.number}>
                  <SkeletonText chars={ANTIKORUPSI_SKELETON_CHARS.number} />
                </span>
                <span className={s.itemText}>
                  <SkeletonText chars={chars} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Panel indikator desa anti korupsi: nama kategori sekali per grup, butir bernomor di bawahnya. */
export function AntiKorupsiGroups({ groups, loading, itemHref, kategoriHref }: AntiKorupsiGroupsProps) {
  if (loading) return <AntiKorupsiGroupsSkeleton />;

  return (
    <div className={s.panel}>
      {groups.map((group) => {
        const headingId = `antikorupsi-kategori-${group.id}`;
        return (
          <section key={group.id} className={s.group} aria-labelledby={headingId}>
            <GroupTitle group={group} headingId={headingId} href={kategoriHref?.(group)} />
            <ul className={itemHref ? `${s.list} ${s.listLinked}` : s.list}>
              {group.items.map((item) => (
                <AntiKorupsiItem key={item.id} item={item} href={itemHref?.(item)} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
