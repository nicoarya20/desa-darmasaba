import { Image } from "@mantine/core";
import { IconNews } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import { formatTanggalKabar, splitFeatured, type KabarItem } from "./kabar.logic";
import { KABAR_BERITA_LIMIT } from "./kabar.meta";
import s from "./kabar.module.css";
import { KABAR_TEXT } from "./kabar.text";

function Meta({ item }: { item: KabarItem }) {
  return (
    <p className={s.meta}>
      {item.kategori ? <span className={s.kategori}>{item.kategori}</span> : null}
      <time dateTime={new Date(item.createdAt).toISOString()}>{formatTanggalKabar(item.createdAt)}</time>
    </p>
  );
}

function Photo({ url }: { url?: string }) {
  if (!url) {
    return (
      <span className={s.photoFallback} aria-hidden>
        <IconNews size={40} stroke={1.25} />
      </span>
    );
  }
  return <Image src={url} alt="" className={s.photoImg} loading="lazy" decoding="async" />;
}

/** Berita terbaru: 1 kartu utama besar + kartu kecil sisanya; seluruh kartu = tautan detail. */
export function KabarBerita({ items, loading }: { items: readonly KabarItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className={s.berita} aria-busy="true" aria-label={KABAR_TEXT.loading}>
        <div className={`${s.featured} ${s.placeholder}`} aria-hidden />
        <ul className={s.rail}>
          {Array.from({ length: KABAR_BERITA_LIMIT - 1 }, (_, i) => (
            <li key={i} className={`${s.card} ${s.placeholder}`} aria-hidden />
          ))}
        </ul>
      </div>
    );
  }

  const { featured, rest } = splitFeatured(items);
  if (!featured) return null;

  return (
    <div className={s.berita}>
      <Link href={featured.href} className={s.featured}>
        <span className={s.featuredPhoto}>
          <Photo url={featured.imageUrl} />
        </span>
        <span className={s.featuredBody}>
          <Meta item={featured} />
          <h3 className={s.featuredTitle}>{featured.title}</h3>
          {featured.summary ? <span className={s.featuredSummary}>{featured.summary}</span> : null}
        </span>
      </Link>

      {rest.length > 0 ? (
        <ul className={s.rail} aria-label={KABAR_TEXT.beritaLabel}>
          {rest.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className={s.card}>
                <span className={s.cardPhoto}>
                  <Photo url={item.imageUrl} />
                </span>
                <span className={s.cardBody}>
                  <Meta item={item} />
                  <h3 className={s.cardTitle}>{item.title}</h3>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
