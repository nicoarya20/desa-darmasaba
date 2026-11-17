import s from "./landing.module.css";
import { buildRibbonPaths, RIBBON_VIEWBOX } from "./ribbons.logic";

const PATHS = buildRibbonPaths();
const { width, height } = RIBBON_VIEWBOX;

/**
 * Latar hero: berkas pita warna diam yang turun dari atas-tengah lalu lewat di belakang foto Perbekel.
 * Warna pita dari variabel CSS --ribbon-n (terang/gelap di landing.module.css); gradasi putih di <defs> hanya masker.
 */
export function HeroRibbons() {
  return (
    <svg
      className={s.ribbons}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="hero-ribbon-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.4" stopColor="#fff" />
        </linearGradient>
        <mask id="hero-ribbon-mask">
          <rect width={width} height={height} fill="url(#hero-ribbon-fade)" />
        </mask>
      </defs>
      <g mask="url(#hero-ribbon-mask)">
        {PATHS.map(({ fill, d }, index) => (
          <path key={index} d={d} fill={fill} />
        ))}
      </g>
    </svg>
  );
}
