import s from './musik-app.module.css';

/** Spasi setinggi bar pemutar musik (88px, ≤734px 72px) setelah footer situs agar tidak tertutup bar. */
export function MusikPlayerSpacer() {
  return <div className={s.playerSpacer} aria-hidden />;
}
