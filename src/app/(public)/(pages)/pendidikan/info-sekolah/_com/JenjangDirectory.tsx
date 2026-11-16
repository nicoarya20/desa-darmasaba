import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { IconSchool } from "@tabler/icons-react";
import { LEMBAGA_ANCHOR, type InfoSekolahRingkasan, type JenjangGroup } from "./info-sekolah.logic";
import { jenjangAccent, namaPanjangJenjang } from "./info-sekolah.meta";
import s from "./info-sekolah.module.css";
import { INFO_SEKOLAH_TEXT as T } from "./info-sekolah.text";

const TITLE_ID = "info-sekolah-direktori-title";

/** Panel "Sekolah per jenjang": satu kelompok per jenjang (urut baku) berisi angka jenjang + ubin nama lembaga. */
export function JenjangDirectory({ ringkasan }: { ringkasan: InfoSekolahRingkasan }) {
  return (
    <section id={LEMBAGA_ANCHOR} className={`${apb.panel} ${s.directory}`} aria-labelledby={TITLE_ID}>
      <div className={s.panelHead}>
        <h2 id={TITLE_ID} className={apb.panelTitle}>
          {T.directoryTitle}
        </h2>
        <p className={s.panelLead}>{T.directoryLead(ringkasan.totalLembaga, ringkasan.groups.length)}</p>
      </div>
      <div className={s.groups}>
        {ringkasan.groups.map((group) => (
          <JenjangGroupBlock key={group.key} group={group} />
        ))}
      </div>
    </section>
  );
}

function JenjangGroupBlock({ group }: { group: JenjangGroup }) {
  const id = `info-sekolah-jenjang-${group.key.replace(/[^a-z0-9]+/g, "-")}`;
  const panjang = namaPanjangJenjang(group.nama);
  return (
    <section className={s.group} aria-labelledby={id}>
      <div className={s.groupHead}>
        <h3 id={id} className={s.groupTitle}>
          <span className={s.badge} style={jenjangAccent(group.nama)}>
            <span className={s.dot} aria-hidden />
            {group.nama}
          </span>
          {panjang ? <span>{panjang}</span> : null}
        </h3>
        <p className={s.groupMeta}>{T.groupMeta(group.lembaga.length, group.jumlahSiswa, group.jumlahPengajar)}</p>
      </div>
      <ul className={s.schools}>
        {group.lembaga.map((lembaga) => (
          <li key={lembaga.id} className={s.school}>
            <span className={s.schoolIcon} aria-hidden>
              <IconSchool size={18} stroke={1.75} />
            </span>
            {lembaga.nama}
          </li>
        ))}
      </ul>
    </section>
  );
}
