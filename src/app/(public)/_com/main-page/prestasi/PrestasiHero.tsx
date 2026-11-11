import { useInViewport, useReducedMotion } from "@mantine/hooks";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";
import { PRESTASI_HERO_VIDEO, PRESTASI_LIST_HREF } from "./prestasi.meta";
import s from "./prestasi.module.css";
import { PRESTASI_TEXT } from "./prestasi.text";

/** Penolakan play() yang wajar: autoplay diblokir browser, atau play() disela pause(). */
function isExpectedPlayRejection(err: unknown): boolean {
  return err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "AbortError");
}

/** Hero section Prestasi: video penghargaan (putar hanya saat terlihat) + judul, subtext, tombol. */
export function PrestasiHero({ titleId }: { titleId: string }) {
  const { ref: viewportRef, inViewport } = useInViewport();
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  // Putar otomatis hanya saat terlihat, tidak dijeda pengguna, dan tanpa "kurangi gerakan".
  const shouldPlay = inViewport && !userPaused && !reducedMotion && !failed;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!shouldPlay) {
      video.pause();
      return;
    }
    video.muted = true;
    video.play().catch((err: unknown) => {
      // Autoplay diblokir → video tetap diam di poster, tombol Putar tersedia untuk pengguna.
      if (!isExpectedPlayRejection(err)) console.error("Gagal memutar video hero prestasi:", err);
    });
  }, [shouldPlay]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      setUserPaused(true);
      video.pause();
      return;
    }
    setUserPaused(false);
    video.play().catch((err: unknown) => {
      console.error("Gagal memutar video hero prestasi setelah ditekan:", err);
    });
  };

  return (
    <div ref={viewportRef} className={s.hero}>
      <video
        ref={videoRef}
        className={s.heroVideo}
        poster={PRESTASI_HERO_VIDEO.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      >
        <source src={PRESTASI_HERO_VIDEO.src} type="video/mp4" />
      </video>
      <span className={s.heroShade} aria-hidden />
      <div className={s.heroContent}>
        <h2 id={titleId} className={s.heroTitle}>
          {PRESTASI_TEXT.title}
        </h2>
        <p className={s.heroText}>{PRESTASI_TEXT.subtitle}</p>
        <Link href={PRESTASI_LIST_HREF} className={s.cta}>
          {PRESTASI_TEXT.cta}
        </Link>
      </div>
      {failed ? null : (
        <button
          type="button"
          className={s.videoToggle}
          onClick={toggle}
          aria-label={playing ? PRESTASI_TEXT.pauseVideo : PRESTASI_TEXT.playVideo}
        >
          {playing ? <IconPlayerPauseFilled size={14} /> : <IconPlayerPlayFilled size={14} />}
        </button>
      )}
    </div>
  );
}
