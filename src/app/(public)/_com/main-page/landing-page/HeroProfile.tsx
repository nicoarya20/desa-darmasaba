import { Image } from "@mantine/core";
import { imageLoadingAttrs } from "../../image-loading.logic";
import s from "./landing.module.css";
import { LANDING_TEXT } from "./landing.text";
import type { PejabatItem } from "./use-landing-data";
import { useFitText } from "./use-fit-text";

/**
 * Foto Perbekel dengan kartu jabatan + nama (selalu satu baris); tanpa foto hanya kartu namanya yang tampil.
 * Foto ini elemen LCP beranda, jadi dimuat langsung berprioritas tinggi.
 */
export function HeroProfile({ data }: { data: PejabatItem }) {
  const photo = data.image?.link;
  const { frameRef, textRef } = useFitText<HTMLElement, HTMLSpanElement>(data.name);
  return (
    <figure ref={frameRef} className={photo ? s.profile : `${s.profile} ${s.profileNoPhoto}`}>
      {photo && (
        <Image
          className={s.photo}
          src={photo}
          alt={data.name || LANDING_TEXT.profilePhotoAlt}
          fit="contain"
          {...imageLoadingAttrs(true)}
        />
      )}
      <figcaption className={s.nameCard}>
        <span className={s.position}>{data.position || LANDING_TEXT.profileFallbackPosition}</span>
        <span ref={textRef} className={s.name}>
          {data.name}
        </span>
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
