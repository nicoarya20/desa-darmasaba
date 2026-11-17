import r from "@/app/(public)/_com/link-reveal/link-reveal.module.css";
import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { IconChalkboard, IconChevronRight, IconSchool, IconUsersGroup, type Icon } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import type { ReactNode } from "react";
import { formatJumlah, PENGAJAR_PATH, type InfoSekolahRingkasan } from "./info-sekolah.logic";
import { jenjangAccent } from "./info-sekolah.meta";
import s from "./info-sekolah.module.css";
import { INFO_SEKOLAH_TEXT as T } from "./info-sekolah.text";

/** Tiga ubin gaya APBDes: lembaga + sebaran per jenjang, siswa (angka saja), pengajar (+ tautan daftar). */
export function InfoSekolahSummary({ ringkasan }: { ringkasan: InfoSekolahRingkasan }) {
  const { groups } = ringkasan;
  const sebaran = groups.map((g) => `${g.nama} ${g.lembaga.length}`).join(", ");

  return (
    <div className={s.summary}>
      <SummaryCard icon={IconSchool} label={T.lembagaLabel}>
        <Amount value={ringkasan.totalLembaga} unit={T.lembagaUnit} />
        <div className={s.stack} role="img" aria-label={`${T.sebaranLabel}: ${sebaran}`}>
          {groups.map((g) => (
            <span key={g.key} className={s.stackPart} style={{ ...jenjangAccent(g.nama), flexBasis: `${g.width}%` }} />
          ))}
        </div>
        <ul className={s.legend}>
          {groups.map((g) => (
            <li key={g.key} className={s.legendItem} style={jenjangAccent(g.nama)}>
              <span className={s.dot} aria-hidden />
              {g.nama} <span className={s.legendCount}>{formatJumlah(g.lembaga.length)}</span>
            </li>
          ))}
        </ul>
      </SummaryCard>

      <SummaryCard icon={IconUsersGroup} label={T.siswaLabel}>
        <Amount value={ringkasan.totalSiswa} unit={T.siswaUnit} />
        <p className={s.foot}>{T.siswaNote}</p>
      </SummaryCard>

      <SummaryCard icon={IconChalkboard} label={T.pengajarLabel}>
        <Amount value={ringkasan.totalPengajar} unit={T.pengajarUnit} />
        <p className={s.foot}>{T.pengajarNote}</p>
        <Link href={PENGAJAR_PATH} className={`${s.cardLink} ${r.trigger}`}>
          <span className={r.cta} data-text={T.pengajarLink}>
            {T.pengajarLink}
          </span>
          <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
        </Link>
      </SummaryCard>
    </div>
  );
}

function Amount({ value, unit }: { value: number; unit: string }) {
  return (
    <p className={apb.amount}>
      {formatJumlah(value)}
      <span className={s.unit}>{unit}</span>
    </p>
  );
}

function SummaryCard({ icon: Icon, label, children }: { icon: Icon; label: string; children: ReactNode }) {
  return (
    <article className={apb.card}>
      <div className={apb.cardHead}>
        <span className={apb.icon} aria-hidden>
          <Icon size={22} stroke={1.75} />
        </span>
        <h2 className={apb.label}>{label}</h2>
      </div>
      {children}
    </article>
  );
}
