'use client';
import { IconPlayerPlayFilled, IconVideoOff } from '@tabler/icons-react';
import { useState } from 'react';
import { youtubeEmbedUrl } from './pencegahan.logic';
import s from './pencegahan.module.css';
import { PENCEGAHAN_TEXT as T } from './pencegahan.text';
import { YoutubeThumb } from './YoutubeThumb';

type Props = { videoId: string; title: string };

/**
 * Video YouTube 16:9 sebagai "fasad": gambar pratinjau + tombol putar; iframe pemutar (± 1 MB skrip YouTube) baru
 * dimuat setelah diklik, lalu langsung diputar. Pratinjau tidak ada (video dihapus/privat) → ubin "Video tidak
 * tersedia" tanpa tombol, agar tidak membuka pemutar yang hanya berisi galat.
 */
export function VideoFacade({ videoId, title }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={s.video} data-video-id={videoId}>
      {playing ? (
        <iframe
          className={s.videoFrame}
          src={youtubeEmbedUrl(videoId)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <YoutubeThumb
          key={videoId}
          videoId={videoId}
          className={s.videoThumb}
          fallback={
            <span className={s.videoMissing}>
              <IconVideoOff size={32} stroke={1.5} aria-hidden />
              {T.videoTidakTersedia}
            </span>
          }
          wrap={(img) => (
            <button type="button" className={s.videoButton} onClick={() => setPlaying(true)} aria-label={T.putar(title)}>
              {img}
              <span className={s.playBadge} aria-hidden>
                <IconPlayerPlayFilled size={30} />
              </span>
            </button>
          )}
        />
      )}
    </div>
  );
}
