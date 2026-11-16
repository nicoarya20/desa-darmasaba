import KontakLink from "@/app/(public)/_com/konten-bersama/kontak.link";
import TombolGoogleMaps from "@/app/(public)/_com/konten-bersama/lokasi.tombol";
import MediaSosialLinks from "@/app/(public)/_com/konten-bersama/media-sosial.links";
import type { LembagaDetail } from "@/lib/lembaga-pendidikan/lembaga.types";
import type { ReactNode } from "react";
import { jenjangAccent, namaPanjangJenjang } from "../info-sekolah.meta";
import s from "../info-sekolah.module.css";
import { LEMBAGA_DETAIL_TEXT as T } from "./lembaga-detail.text";
import d from "./lembaga-detail.module.css";

function Baris({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={d.infoRow}>
      <dt className={d.infoLabel}>{label}</dt>
      <dd className={d.infoValue}>{children}</dd>
    </div>
  );
}

/** Panel "Informasi" detail sekolah: jenjang, angka siswa/pengajar, lalu alamat/kontak/medsos yang terisi saja. */
export function LembagaDetailInfo({ data }: { data: LembagaDetail }) {
  const jenjang = data.jenjangPendidikan?.nama ?? null;
  const titik = { lat: data.lat ?? undefined, lng: data.lng ?? undefined };
  const tautanMaps = <TombolGoogleMaps link={data.linkGoogleMaps} koordinat={titik} />;
  return (
    <aside className={d.info} aria-labelledby="lembaga-info-title">
      <h2 id="lembaga-info-title" className={d.infoTitle}>
        {T.infoTitle}
      </h2>
      <dl className={d.infoList}>
        {jenjang ? (
          <Baris label={T.jenjangLabel}>
            <span className={s.badge} style={jenjangAccent(jenjang)}>
              <span className={s.dot} aria-hidden />
              {jenjang}
            </span>{" "}
            {namaPanjangJenjang(jenjang) ?? ""}
          </Baris>
        ) : null}
        <Baris label={T.angkaLabel}>{T.angka(data._count.siswa, data._count.pengajar)}</Baris>
        {data.alamat ? (
          <Baris label={T.alamatLabel}>
            <span className={d.prewrap}>{data.alamat}</span>
            <span className={d.infoAction}>{tautanMaps}</span>
          </Baris>
        ) : null}
        {data.kontak ? (
          <Baris label={T.kontakLabel}>
            <KontakLink kontak={data.kontak} />
          </Baris>
        ) : null}
        {data.mediaSosial.length > 0 ? (
          <Baris label={T.medsosLabel}>
            <MediaSosialLinks items={data.mediaSosial} />
          </Baris>
        ) : null}
      </dl>
      {/* Tanpa alamat, tombol Google Maps tetap tersedia bila ada link/titik. */}
      {!data.alamat ? <div className={d.infoAction}>{tautanMaps}</div> : null}
    </aside>
  );
}
