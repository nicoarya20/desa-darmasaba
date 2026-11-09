import type { AntiKorupsiGroup } from "./desaantikorupsi.logic";
import { ANTIKORUPSI_LIMIT } from "./desaantikorupsi.meta";
import s from "./desaantikorupsi.module.css";

/** Panel indikator desa anti korupsi: nama kategori sekali per grup, butir bernomor di bawahnya. */
export function AntiKorupsiGroups({ groups, loading }: { groups: readonly AntiKorupsiGroup[]; loading: boolean }) {
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
            <h3 id={headingId} className={s.groupTitle}>
              {group.name}
            </h3>
            <ul className={s.list}>
              {group.items.map((item) => (
                <li key={item.id} className={s.item}>
                  {item.number ? <span className={s.number}>{item.number}</span> : null}
                  <span className={s.itemText}>{item.text}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
