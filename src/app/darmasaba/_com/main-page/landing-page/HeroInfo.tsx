import { getSosmedHref } from "@/app/admin/(dashboard)/landing-page/profil/_lib/sosmed";
import { Image } from "@mantine/core";
import { describeWorkStatus, getSosmedIconSrc, type WorkStatus } from "./landing.logic";
import s from "./landing.module.css";
import { LANDING_TEXT } from "./landing.text";
import type { SosmedItem } from "./use-landing-data";

/** Status kantor satu baris: titik hijau/merah, buka/tutup, lalu jam layanan atau nama hari libur. */
export function HeroStatus({ status }: { status: WorkStatus | null }) {
  if (!status) {
    return <p className={`${s.status} ${s.statusLoading}`} aria-label={LANDING_TEXT.statusLoading} />;
  }
  const open = status.status === "Buka";
  return (
    <p className={s.status}>
      <span className={open ? s.dotOpen : s.dotClosed} aria-hidden />
      <strong>{open ? LANDING_TEXT.open : LANDING_TEXT.closed}</strong>
      <span className={s.statusDetail}>{describeWorkStatus(status, LANDING_TEXT.hoursPrefix)}</span>
    </p>
  );
}

/** Tautan media sosial desa sebagai ikon bulat; entri tanpa tautan valid dilewati. */
export function HeroSosmed({ data }: { data: SosmedItem[] }) {
  const links = data
    .map((item) => ({ item, href: getSosmedHref(item.icon, item.iconUrl), src: getSosmedIconSrc(item) }))
    .filter((link) => link.href);
  if (links.length === 0) return null;

  return (
    <ul className={s.sosmed} aria-label={LANDING_TEXT.sosmedLabel}>
      {links.map(({ item, href, src }) => {
        const name = item.name || LANDING_TEXT.sosmedFallback;
        return (
          <li key={item.id}>
            <a
              className={s.sosmedLink}
              href={href as string}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              title={name}
            >
              {src ? (
                <Image className={s.sosmedIcon} src={src} alt="" loading="lazy" fit="contain" />
              ) : (
                <span className={s.sosmedInitial} aria-hidden>
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
