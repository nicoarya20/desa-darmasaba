'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import { useProxy } from 'valtio/utils';
import { ProfilCard, ProfilCardSkeleton, ProfilEmpty } from '../_com/ProfilCard';
import { KANTOR_MAP_EMBED_URL } from '../_com/profil.meta';
import { PROFIL_TEXT } from '../_com/profil.text';
import { useLoadOnce } from '../_com/use-load-once';
import m from './media.module.css';

const T = PROFIL_TEXT.wilayah;

const ARAH_LIST = [
  { key: 'batasUtara', label: 'Utara' },
  { key: 'batasSelatan', label: 'Selatan' },
  { key: 'batasTimur', label: 'Timur' },
  { key: 'batasBarat', label: 'Barat' },
] as const;

/**
 * Section Letak & Batas Wilayah: batas empat arah, luas, keterangan, lalu peta. Peta wilayah dari CMS bila ada;
 * bila belum diisi admin, tampil peta Kantor Perbekel (sebelumnya peta tanpa judul di puncak halaman).
 */
function WilayahDesa() {
  const state = useProxy(stateProfileDesa.wilayahDesa);
  const loaded = useLoadOnce(() => state.findUnique.load());
  const { data, error } = state.findUnique;

  if (!loaded && !data) return <ProfilCardSkeleton label={T.loading} rows={3} />;

  const hasBatas = !!data && (ARAH_LIST.some(({ key }) => !!data[key]) || data.luasWilayah != null);
  const mapUrl = data?.petaEmbedUrl || KANTOR_MAP_EMBED_URL;
  const isOfficeMap = !data?.petaEmbedUrl;

  return (
    <ProfilCard title={T.title}>
      {hasBatas && data ? (
        <>
          <dl className={m.sides}>
            {ARAH_LIST.map(({ key, label }) => (
              <div key={key} className={m.side}>
                <dt className={m.sideLabel}>{T.side(label)}</dt>
                <dd className={m.sideValue}>{data[key] || '–'}</dd>
              </div>
            ))}
          </dl>
          {data.luasWilayah != null ? (
            <p className={m.area}>
              {T.luas}: <strong>{new Intl.NumberFormat('id-ID').format(data.luasWilayah)} ha</strong>
            </p>
          ) : null}
        </>
      ) : (
        <ProfilEmpty>{error ? T.error : T.empty}</ProfilEmpty>
      )}

      {data?.keterangan ? <p className={m.note}>{data.keterangan}</p> : null}

      <figure className={m.map}>
        <iframe
          src={mapUrl}
          title={isOfficeMap ? T.officeMapTitle : T.mapTitle}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-popups"
          className={m.mapFrame}
        />
        {isOfficeMap ? <figcaption className={m.mapCaption}>{T.officeCaption}</figcaption> : null}
      </figure>
    </ProfilCard>
  );
}

export default WilayahDesa;
