import Link from "next/link";
import { AntiKorupsiItem } from "./AntiKorupsiItem";
import type { AntiKorupsiGroup, AntiKorupsiIndicator } from "./desaantikorupsi.logic";
import { ANTIKORUPSI_LIMIT } from "./desaantikorupsi.meta";
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
      <Link href={href} className={s.groupLink}>
        <span id={headingId}>{group.name}</span>
        <span className={s.groupHint}>
          {ANTIKORUPSI_TEXT.lihatDokumen} <span aria-hidden>→</span>
        </span>
      </Link>
    </h3>
  );
}

/** Panel indikator desa anti korupsi: nama kategori sekali per grup, butir bernomor di bawahnya. */
export function AntiKorupsiGroups({ groups, loading, itemHref, kategoriHref }: AntiKorupsiGroupsProps) {
  if (loading) {
    return (
      <div className={s.panel} aria-hidden>
        {Array.from({ length: ANTIKORUPSI_LIMIT }, (_, i) => (
          <div key={i} className={s.rowPlaceholder} />
        ))}
      </div>
    );
  }

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
