'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { publicLhkpnUrl } from '@/lib/profil-perbekel-lhkpn';
import { Image } from '@mantine/core';
import {
  IconBrandGoogleDrive,
  IconBriefcase,
  IconExternalLink,
  IconFileCertificate,
  IconTargetArrow,
  IconUser,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import { ProfilCard, ProfilCardSkeleton, ProfilEmpty, ProfilProse } from '../_com/ProfilCard';
import { PERBEKEL_FALLBACK_SRC, PERBEKEL_NAME, PERBEKEL_ROLE, PROFIL_CMS_ID } from '../_com/profil.meta';
import { PROFIL_TEXT } from '../_com/profil.text';
import { useLoadOnce } from '../_com/use-load-once';
import p from './perbekel.module.css';

const T = PROFIL_TEXT.perbekel;

/** Satu blok riwayat di kolom kanan: ikon + judul rata kiri, isi HTML dari CMS. */
function InfoBlock({ icon: IconEl, title, html }: { icon: Icon; title: string; html: string }) {
  if (!html) return null;
  return (
    <section className={p.block}>
      <h3 className={p.blockTitle}>
        <IconEl size={26} stroke={1.75} aria-hidden />
        {title}
      </h3>
      <ProfilProse html={html} className={p.blockBody} />
    </section>
  );
}

/** Blok Laporan LHKPN: satu tautan ke berkas Google Drive (tab baru). Tidak dirender bila link kosong/tidak valid. */
function LhkpnBlock({ url }: { url: string | null | undefined }) {
  const href = publicLhkpnUrl(url);
  if (!href) return null;
  return (
    <section className={p.block}>
      <h3 className={p.blockTitle}>
        <IconFileCertificate size={26} stroke={1.75} aria-hidden />
        {T.lhkpn}
      </h3>
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${p.lhkpnLink} ${r.trigger}`}>
        <IconBrandGoogleDrive size={30} stroke={1.5} className={p.lhkpnIcon} aria-hidden />
        <span className={p.lhkpnText}>
          <span className={`${p.lhkpnLabel} ${r.cta}`} data-text={T.lhkpnLink}>
            {T.lhkpnLink}
          </span>
          <span className={p.lhkpnMeta}>{T.lhkpnMeta}</span>
        </span>
        <IconExternalLink size={20} stroke={1.75} className={`${p.lhkpnIcon} ${r.chevron}`} aria-hidden />
      </a>
    </section>
  );
}

/**
 * Section Profil Perbekel — pola Profil PPID: 2 kolom mulai 1200px, kiri kartu foto + nama (sticky),
 * kanan Biodata, Pengalaman, Pengalaman Organisasi, Program Kerja Unggulan, Laporan LHKPN; satu kolom di bawahnya.
 */
function ProfilPerbekel() {
  const state = useProxy(stateProfileDesa.profilPerbekel);
  const loaded = useLoadOnce(() => state.findUnique.load(PROFIL_CMS_ID));
  const { data } = state.findUnique;

  if (!loaded && !data) return <ProfilCardSkeleton label={T.loading} rows={8} />;
  if (!data) {
    return (
      <ProfilCard title={T.title}>
        <ProfilEmpty>{T.empty}</ProfilEmpty>
      </ProfilCard>
    );
  }

  return (
    <ProfilCard title={T.title}>
      <div className={p.grid}>
        <div className={p.photoColumn}>
          <figure className={p.photoCard}>
            <div className={p.photoFrame}>
              <Image
                src={data.image?.link || PERBEKEL_FALLBACK_SRC}
                alt={T.photoAlt(PERBEKEL_NAME)}
                className={p.photo}
                onError={(e) => {
                  e.currentTarget.src = PERBEKEL_FALLBACK_SRC;
                }}
              />
            </div>
            <figcaption className={p.nameBar}>
              <span className={p.role}>{PERBEKEL_ROLE}</span>
              <span className={p.name}>{PERBEKEL_NAME}</span>
            </figcaption>
          </figure>
        </div>

        <div className={p.info}>
          <InfoBlock icon={IconUser} title={T.biodata} html={data.biodata} />
          <InfoBlock icon={IconBriefcase} title={T.pengalaman} html={data.pengalaman} />
          <InfoBlock icon={IconUsers} title={T.organisasi} html={data.pengalamanOrganisasi} />
          <InfoBlock icon={IconTargetArrow} title={T.program} html={data.programUnggulan} />
          <LhkpnBlock url={data.lhkpnUrl} />
        </div>
      </div>
    </ProfilCard>
  );
}

export default ProfilPerbekel;
