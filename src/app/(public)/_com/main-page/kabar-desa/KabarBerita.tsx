import { Image } from "@mantine/core";
import { IconNews } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import { imageLoadingAttrs } from "../../image-loading.logic";
import r from "../../link-reveal/link-reveal.module.css";
import { responsiveImageProps } from "../../responsive-image.logic";
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

/**
 * `sizes` foto per breakpoint (kabar.module.css; 734px/1068px = breakpoint ponsel/tablet). Foto `object-fit: cover`
 * pada kotak 16:10 dari foto 16:9 diskalakan mengikuti TINGGI kotak, jadi lebar yang dibutuhkan ±11% di atas lebar
 * kotak; angka kartu sudah memasukkannya agar browser tidak memilih berkas yang terlalu kecil (buram).
 */
const PHOTO_SIZES = {
  featured: "(max-width: 734px) 100vw, 60vw",
  rail: "(max-width: 734px) 87vw, 38vw",
  grid: "(max-width: 734px) 111vw, (max-width: 1068px) 56vw, 38vw",
} as const;

/** `aboveFold`: foto kandidat LCP (berita utama halaman daftar) diunduh langsung, bukan lazy. */
function Photo({ url, sizes, aboveFold = false }: { url?: string; sizes: string; aboveFold?: boolean }) {
  if (!url) {
    return (
      <span className={s.photoFallback} aria-hidden>
        <IconNews size={40} stroke={1.25} />
      </span>
    );
  }
  return (
    <Image
      alt=""
      className={s.photoImg}
      {...responsiveImageProps(url, sizes)}
      {...imageLoadingAttrs(aboveFold)}
      decoding="async"
    />
  );
}

type Props = {
  items: readonly KabarItem[];
  loading: boolean;
  /**
   * `rail` (beranda): 3 kartu kecil, di ponsel jadi baris geser.
   * `grid` (halaman daftar berita): kartu kecil membungkus ke baris baru, di ponsel bertumpuk; berita utamanya
   * ada di atas lipatan sehingga fotonya dimuat langsung (bukan lazy).
   */
  layout?: "rail" | "grid";
  /** Jumlah kerangka kartu kecil saat memuat. */
  placeholderCards?: number;
  /** Label pembaca layar daftar kartu kecil (bawaan: "Berita terbaru"). */
  listLabel?: string;
  /** Label pembaca layar saat memuat (bawaan: "Memuat kabar desa"). */
  loadingLabel?: string;
};

/** Berita terbaru: 1 kartu utama besar + kartu kecil sisanya; seluruh kartu = tautan detail. */
export function KabarBerita({
  items,
  loading,
  layout = "rail",
  placeholderCards = KABAR_BERITA_LIMIT - 1,
  listLabel = KABAR_TEXT.beritaLabel,
  loadingLabel = KABAR_TEXT.loading,
}: Props) {
  const railClass = layout === "grid" ? `${s.rail} ${s.railGrid}` : s.rail;

  if (loading) {
    return (
      <div className={s.berita} aria-busy="true" aria-label={loadingLabel}>
        <div className={`${s.featured} ${s.placeholder}`} aria-hidden />
        <ul className={railClass}>
          {Array.from({ length: placeholderCards }, (_, i) => (
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
      <Link href={featured.href} className={`${s.featured} ${r.trigger}`}>
        <span className={s.featuredPhoto}>
          <Photo url={featured.imageUrl} sizes={PHOTO_SIZES.featured} aboveFold={layout === "grid"} />
        </span>
        <span className={s.featuredBody}>
          <Meta item={featured} />
          <h3 className={s.featuredTitle}>
            <span className={r.title}>{featured.title}</span>
          </h3>
          {featured.summary ? <span className={s.featuredSummary}>{featured.summary}</span> : null}
        </span>
      </Link>

      {rest.length > 0 ? (
        <ul className={railClass} aria-label={listLabel}>
          {rest.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className={`${s.card} ${r.trigger}`}>
                <span className={s.cardPhoto}>
                  <Photo url={item.imageUrl} sizes={PHOTO_SIZES[layout]} />
                </span>
                <span className={s.cardBody}>
                  <Meta item={item} />
                  <h3 className={s.cardTitle}>
                    <span className={r.title}>{item.title}</span>
                  </h3>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
