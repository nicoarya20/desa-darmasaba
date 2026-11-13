'use client';
import BackButton from "@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto";
import d from "@/app/(public)/_com/kabar-list/kabar-detail.module.css";
import { KABAR_BRAND_VARS } from "@/app/(public)/_com/main-page/kabar-desa/kabar.meta";
import kabar from "@/app/(public)/_com/main-page/kabar-desa/kabar.module.css";
import { jadwalToLines, jadwalToText } from "@/lib/jadwal-pelayanan";
import { Image } from "@mantine/core";
import { IconCalendarTime, IconChevronRight, IconMapPin, IconPhone, type Icon } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import { useState, type ReactNode } from "react";
import { banjarLabel, posyanduTabHref, telHref } from "../posyandu.logic";
import type { PosyanduItem } from "../posyandu.source";
import { POSYANDU_TEXT as T } from "../posyandu.text";
import s from "./posyandu-detail.module.css";
import { usePosyanduDetail } from "./use-posyandu-detail";

/** Halaman detail posyandu (pola detail Pengumuman, kolom 860px): banjar, nama, foto bila ada, info, deskripsi. */
export function PosyanduDetail({ id }: { id: string }) {
  const state = usePosyanduDetail(id);

  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === "loading" || undefined}>
      <div className={d.wrap}>
        <BackButton />
        {state.status === "loading" ? <DetailPlaceholder /> : null}
        {state.status === "ready" ? <PosyanduDetailBody data={state.data} /> : null}
        {state.status === "notfound" || state.status === "error" ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === "notfound" ? T.detailNotFound : T.detailFailed}</p>
            <Link href={posyanduTabHref("posyandu")} className={d.emptyLink}>
              {T.backToList}
              <IconChevronRight size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Isi detail (dipisah agar bisa dites tanpa memuat data). */
export function PosyanduDetailBody({ data }: { data: PosyanduItem }) {
  const banjar = data.banjar?.name ? banjarLabel(data.banjar.name) : "";
  const nomor = data.nomor?.trim() ?? "";
  const tel = telHref(nomor);
  const deskripsi = data.deskripsi?.trim() ?? "";
  const adaDeskripsi = deskripsi.replace(/<[^>]*>|&nbsp;/g, "").trim().length > 0;

  return (
    <>
      <header className={d.head}>
        {banjar ? <p className={`${d.meta} ${d.kategori}`}>{banjar}</p> : null}
        <h1 className={d.title}>{data.name}</h1>
      </header>

      {data.image?.link ? <Photo link={data.image.link} name={data.name} /> : null}

      <dl className={s.info}>
        <InfoRow icon={IconMapPin} label={T.infoBanjar}>
          {banjar || <span className={s.kosong}>{T.banjarKosong}</span>}
        </InfoRow>
        <InfoRow icon={IconCalendarTime} label={T.infoJadwal}>
          <JadwalLines value={data.jadwalPelayanan} />
        </InfoRow>
        <InfoRow icon={IconPhone} label={T.infoTelepon}>
          {tel ? (
            <span className={s.phone}>
              <span className={s.phoneNumber}>{nomor}</span>
              <a href={tel} className={s.call} aria-label={T.telepon(nomor)}>
                <IconPhone size={16} stroke={1.75} aria-hidden />
                {T.callButton}
              </a>
            </span>
          ) : (
            <span className={s.kosong}>{T.nomorKosong}</span>
          )}
        </InfoRow>
      </dl>

      {adaDeskripsi ? (
        <section className={s.block} aria-labelledby="posyandu-tentang">
          <h2 id="posyandu-tentang" className={s.blockTitle}>
            {T.tentang}
          </h2>
          {/* Isi dari editor admin (HTML tepercaya), sama seperti halaman sebelumnya. */}
          <div className={d.content} dangerouslySetInnerHTML={{ __html: deskripsi }} />
        </section>
      ) : null}
    </>
  );
}

/** Foto selebar kolom; tautan foto rusak → bagian foto disembunyikan (tanpa placeholder). */
function Photo({ link, name }: { link: string; name: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    <figure className={d.photo}>
      <a href={link} target="_blank" rel="noopener noreferrer" aria-label={T.fotoLabel(name)}>
        <Image src={link} alt={name} className={d.photoImg} onError={() => setBroken(true)} />
      </a>
    </figure>
  );
}

function InfoRow({ icon: Icon, label, children }: { icon: Icon; label: string; children: ReactNode }) {
  return (
    <div className={s.infoRow}>
      <span className={s.infoIcon} aria-hidden>
        <Icon size={20} stroke={1.75} />
      </span>
      <dt className={s.infoLabel}>{label}</dt>
      <dd className={s.infoValue}>{children}</dd>
    </div>
  );
}

/** Jadwal terstruktur per baris ("Senin–Jumat 08.00–12.00"); data lama berupa teks/HTML → teks polos satu baris. */
function JadwalLines({ value }: { value: string | null }) {
  const lines = jadwalToLines(value);
  if (lines.length > 0) {
    return (
      <span className={s.jadwalList}>
        {lines.map((line, i) => (
          <span key={i}>
            <strong>{line.label}</strong>
            {line.jam ? ` ${line.jam}` : null}
          </span>
        ))}
      </span>
    );
  }
  const text = jadwalToText(value);
  return text ? <>{text}</> : <span className={s.kosong}>{T.jadwalKosong}</span>;
}

function DetailPlaceholder() {
  return (
    <div className={d.placeholder} aria-label={T.detailLoading}>
      <span className={`${d.bar} ${d.barMeta}`} />
      <span className={`${d.bar} ${d.barTitle}`} />
      <span className={`${d.bar} ${d.barFigure}`} />
    </div>
  );
}
