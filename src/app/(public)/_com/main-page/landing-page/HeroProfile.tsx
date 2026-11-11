import { Image } from "@mantine/core";
import s from "./landing.module.css";
import { LANDING_TEXT } from "./landing.text";
import type { PejabatItem } from "./use-landing-data";

/** Foto Perbekel dengan kartu jabatan + nama; tanpa foto hanya kartu namanya yang tampil. */
export function HeroProfile({ data }: { data: PejabatItem }) {
  const photo = data.image?.link;
  return (
    <figure className={photo ? s.profile : `${s.profile} ${s.profileNoPhoto}`}>
      {photo && (
        <Image className={s.photo} src={photo} alt={data.name || LANDING_TEXT.profilePhotoAlt} fit="contain" />
      )}
      <figcaption className={s.nameCard}>
        <span className={s.position}>{data.position || LANDING_TEXT.profileFallbackPosition}</span>
        <span className={s.name}>{data.name}</span>
      </figcaption>
    </figure>
  );
}

/** Placeholder seukuran foto + kartu nama selama profil dimuat. */
export function HeroProfileSkeleton() {
  return (
    <div className={s.profile} aria-hidden>
      <div className={`${s.photoSkeleton} ${s.pulse}`} />
    </div>
  );
}
