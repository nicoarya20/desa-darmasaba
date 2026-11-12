import { useId, type ReactNode } from "react";
import s from "./layanan.module.css";

type Props = {
  title: string;
  lead?: string;
  /** Isi kanan kepala bagian (mis. kolom cari); turun ke bawah pengantar di ponsel. */
  aside?: ReactNode;
  /** Isi tambahan di bawah pengantar (mis. badge waktu & biaya). */
  meta?: ReactNode;
  children: ReactNode;
};

/** Satu bagian halaman Layanan: judul `h2`, pengantar, slot kanan, lalu isi. */
export function LayananSection({ title, lead, aside, meta, children }: Props) {
  const headingId = useId();
  return (
    <section className={s.section} aria-labelledby={headingId}>
      <div className={s.sectionHead}>
        <div className={s.sectionIntro}>
          <h2 id={headingId} className={s.sectionTitle}>
            {title}
          </h2>
          {lead ? <p className={s.sectionLead}>{lead}</p> : null}
          {meta}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
