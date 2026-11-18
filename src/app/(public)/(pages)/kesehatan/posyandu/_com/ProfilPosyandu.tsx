import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import type { LoadState } from "@/app/(public)/_com/lazy-load/use-lazy-load";
import d from "@/app/(public)/_com/kabar-list/kabar-detail.module.css";
import rt from "@/app/(public)/_com/rich-text/rich-text.module.css";
import type { KlasterPosyanduItem, ProfilPosyanduData } from "@/lib/posyandu/posyandu-konten.types";
import { LABEL_SASARAN_KLASTER, type SasaranKlaster } from "@/lib/posyandu/posyandu-konten.validation";
import { htmlToPlainText } from "@/lib/rich-text";
import { Image } from "@mantine/core";
import { IconBabyCarriage, IconClock, IconOld, IconUsersGroup, type Icon } from "@tabler/icons-react";
import { ACCENT } from "./posyandu.meta";
import p from "./posyandu-profil.module.css";
import { POSYANDU_TEXT as T } from "./posyandu.text";
import { PosyanduEmpty, PosyanduNotice, PosyanduSkeleton } from "./PosyanduStates";

const PROFIL_ID = "posyandu-profil-title";
const KLASTER_ID = "posyandu-klaster-title";

const IKON: Record<SasaranKlaster, Icon> = { balita: IconBabyCarriage, remaja: IconUsersGroup, lansia: IconOld };
const AKSEN = { balita: ACCENT.teal, remaja: ACCENT.brand, lansia: ACCENT.orange } as const;

/** Bagian atas tab Ringkasan: deskripsi umum posyandu + kartu kegiatan per klaster. */
export function ProfilPosyanduPanel({ state, onRetry }: { state: LoadState<ProfilPosyanduData>; onRetry: () => void }) {
  if (state.status === "error") return <PosyanduNotice message={T.profilFailed} onRetry={onRetry} />;
  if (state.status !== "ready") return <PosyanduSkeleton label={T.profilLoading} count={1} height={260} />;
  return <ProfilPosyanduContent data={state.data} />;
}

/** Isi profil & klaster (dipisah agar bisa dites tanpa memuat data). Bagian tanpa isi tidak dirender. */
export function ProfilPosyanduContent({ data }: { data: ProfilPosyanduData }) {
  const deskripsi = adaIsi(data.profil?.deskripsi) ? data.profil?.deskripsi : null;
  const fungsi = adaIsi(data.profil?.fungsiKegiatan) ? data.profil?.fungsiKegiatan : null;
  if (!deskripsi && !fungsi && data.klaster.length === 0) return <PosyanduEmpty message={T.profilEmpty} />;

  return (
    <>
      {deskripsi || fungsi ? (
        <section className={apb.panel} aria-labelledby={PROFIL_ID}>
          <h2 id={PROFIL_ID} className={apb.panelTitle}>
            {T.profilTitle}
          </h2>
          {/* Teks kaya dari admin, dibersihkan (allowlist tag) saat disimpan di API. */}
          {deskripsi ? <div className={`${d.content} ${p.richText} ${rt.root}`} dangerouslySetInnerHTML={{ __html: deskripsi }} /> : null}
          {fungsi ? (
            <>
              <h3 className={p.subTitle}>{T.fungsiTitle}</h3>
              <div className={`${d.content} ${p.richText} ${rt.root}`} dangerouslySetInnerHTML={{ __html: fungsi }} />
            </>
          ) : null}
        </section>
      ) : null}
      {data.klaster.length > 0 ? (
        <section aria-labelledby={KLASTER_ID}>
          <h2 id={KLASTER_ID} className={`${apb.panelTitle} ${p.klasterTitle}`}>
            {T.klasterTitle}
          </h2>
          <p className={p.klasterLead}>{T.klasterLead}</p>
          <ul className={p.klasterGrid}>
            {data.klaster.map((k) => (
              <KlasterCard key={k.id} item={k} />
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

/** Kartu satu klaster: ikon sasaran, judul, fokus layanan, jam pelayanan; gambar hanya bila ada. */
function KlasterCard({ item }: { item: KlasterPosyanduItem }) {
  const Ikon = IKON[item.sasaran] ?? IconUsersGroup;
  const jam = item.jamPelayanan?.trim();
  return (
    <li className={`${apb.card} ${p.klasterCard}`} style={AKSEN[item.sasaran] ?? ACCENT.brand} data-sasaran={item.sasaran}>
      {item.image?.link ? <Image src={item.image.link} alt="" className={p.klasterImg} loading="lazy" decoding="async" /> : null}
      <div className={apb.cardHead}>
        <span className={apb.icon} aria-hidden>
          <Ikon size={22} stroke={1.75} />
        </span>
        <div>
          <p className={p.kicker}>{LABEL_SASARAN_KLASTER[item.sasaran] ?? item.sasaran}</p>
          <h3 className={apb.label}>{item.judul}</h3>
        </div>
      </div>
      <p className={p.fokus}>{item.deskripsi}</p>
      <p className={`${p.jam} ${jam ? "" : p.kosong}`}>
        <IconClock size={16} stroke={1.75} aria-hidden />
        <span>{jam ? T.jamLabel(jam) : T.jamKosong}</span>
      </p>
    </li>
  );
}

function adaIsi(html: string | null | undefined): html is string {
  return htmlToPlainText(html) !== "";
}
