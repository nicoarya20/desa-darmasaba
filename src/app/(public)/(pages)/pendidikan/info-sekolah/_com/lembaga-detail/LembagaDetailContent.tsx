'use client';
import GaleriFoto from "@/app/(public)/_com/konten-bersama/galeri-foto.grid";
import PetaLokasi from "@/app/(public)/_com/konten-bersama/lokasi.peta";
import StrukturPengurusView from "@/app/(public)/_com/konten-bersama/struktur-pengurus.view";
import type { LembagaDetail } from "@/lib/lembaga-pendidikan/lembaga.types";
import { Image } from "@mantine/core";
import type { ReactNode } from "react";
import { LembagaDetailInfo } from "./LembagaDetailInfo";
import { LEMBAGA_DETAIL_TEXT as T } from "./lembaga-detail.text";
import d from "./lembaga-detail.module.css";

function Bagian({ id, judul, children }: { id: string; judul: string; children: ReactNode }) {
  return (
    <section className={d.section} aria-labelledby={id}>
      <h2 id={id} className={d.sectionTitle}>
        {judul}
      </h2>
      {children}
    </section>
  );
}

/**
 * Isi detail sekolah (halaman publik + pratinjau admin): foto sekolah, profil + panel informasi, lokasi,
 * struktur organisasi, foto kegiatan. Bagian tanpa data tidak dirender.
 */
export default function LembagaDetailContent({ data }: { data: LembagaDetail }) {
  const adaStruktur = data.fotoBaganStruktur !== null || data.pengurus.length > 0;
  const adaTitik = typeof data.lat === "number" && typeof data.lng === "number";
  return (
    <div className={d.content} data-testid="lembaga-detail">
      {data.fotoSekolah ? (
        <Image className={d.hero} src={data.fotoSekolah.link} alt={T.fotoSekolahAlt(data.nama)} fit="cover" />
      ) : null}

      <div className={d.overview}>
        {data.deskripsi ? (
          <Bagian id="lembaga-profil" judul={T.profilTitle}>
            <p className={`${d.prose} ${d.prewrap}`}>{data.deskripsi}</p>
          </Bagian>
        ) : null}
        <LembagaDetailInfo data={data} />
      </div>

      {adaTitik ? (
        <Bagian id="lembaga-lokasi" judul={T.lokasiTitle}>
          <PetaLokasi lat={data.lat} lng={data.lng} label={T.petaLabel(data.nama)} />
        </Bagian>
      ) : null}

      {adaStruktur ? (
        <Bagian id="lembaga-struktur" judul={T.strukturTitle}>
          <StrukturPengurusView bagan={data.fotoBaganStruktur} pengurus={data.pengurus} namaPemilik={data.nama} />
        </Bagian>
      ) : null}

      {data.fotoKegiatan.length > 0 ? (
        <Bagian id="lembaga-galeri" judul={T.galeriTitle}>
          <GaleriFoto
            foto={data.fotoKegiatan}
            namaPemilik={data.nama}
            judul={null}
            ariaLabel={T.galeriLabel(data.nama)}
            testId="galeri-lembaga"
          />
        </Bagian>
      ) : null}
    </div>
  );
}
