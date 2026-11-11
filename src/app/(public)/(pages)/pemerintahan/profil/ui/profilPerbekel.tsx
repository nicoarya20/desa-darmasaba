'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import { Image } from '@mantine/core';
import { IconBriefcase, IconTargetArrow, IconUser, IconUsers, type Icon } from '@tabler/icons-react';
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

/**
 * Section Profil Perbekel — pola Profil PPID: 2 kolom mulai 1200px, kiri kartu foto + nama (sticky),
 * kanan Biodata, Pengalaman, Pengalaman Organisasi, Program Kerja Unggulan; satu kolom di bawahnya.
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
        </div>
      </div>
    </ProfilCard>
  );
}

export default ProfilPerbekel;
