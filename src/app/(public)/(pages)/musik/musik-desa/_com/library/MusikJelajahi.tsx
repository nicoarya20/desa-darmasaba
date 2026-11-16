'use client';

import { IconMoodEmpty } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';
import { JelajahiFilters } from './JelajahiFilters';
import { JelajahiResultHead } from './JelajahiResultHead';
import { MusikEmpty } from './MusikEmpty';
import { MusikHeading } from './MusikHeading';
import { MusikLoadError } from './MusikLoadError';
import { MusikSkeleton } from './MusikSkeleton';
import { TrackTable } from './TrackTable';
import {
  filterTracks,
  resolveJelajahi,
  visibleArtists,
  withKnownKeys,
  type JelajahiParams,
} from './musik-jelajahi.logic';
import { MUSIK_TEXT as T } from './musik-library.text';
import { useJelajahiParams } from './use-jelajahi-params';
import { useMusikLibrary, type MusikLibrary } from './use-musik-library';
import s from './jelajahi.module.css';

type Props = Pick<
  MusikLibrary,
  'tracks' | 'artists' | 'genres' | 'isLoading' | 'loadError' | 'onRetry' | 'currentId' | 'isPlaying' | 'onPlay'
> & {
  params: JelajahiParams;
  update: (change: (current: JelajahiParams) => JelajahiParams) => void;
};

/** Jelajahi: saring pustaka lewat `?q` `?genre` `?artis`; kunci yang tidak dikenal diabaikan. */
export function MusikJelajahiView(props: Props) {
  const { tracks, artists, genres, isLoading, loadError, onRetry, currentId, isPlaying, onPlay, params, update } = props;
  const filter = useMemo(() => resolveJelajahi(params, genres, artists), [params, genres, artists]);
  const results = useMemo(() => filterTracks(tracks, filter), [tracks, filter]);
  const artistChoices = useMemo(() => visibleArtists(artists, tracks, filter), [artists, tracks, filter]);
  // Setiap perubahan filter menulis ulang URL tanpa kunci genre/artis yang tidak dikenal pustaka.
  const updateKnown = useCallback(
    (change: (current: JelajahiParams) => JelajahiParams) => update(withKnownKeys(change, genres, artists)),
    [update, genres, artists],
  );

  return (
    <div>
      <MusikHeading title={T.jelajahiTitle} />
      {isLoading ? (
        <MusikSkeleton variant="list" />
      ) : loadError && !tracks.length ? (
        <MusikLoadError onRetry={onRetry} />
      ) : (
        <>
          <JelajahiFilters genres={genres} artists={artistChoices} filter={filter} update={updateKnown} />
          <section className={s.results}>
            <JelajahiResultHead count={results.length} filter={filter} update={updateKnown} />
            {results.length ? (
              <TrackTable tracks={results} currentId={currentId} isPlaying={isPlaying} onPlay={onPlay} />
            ) : (
              <MusikEmpty
                icon={<IconMoodEmpty size={40} stroke={1.5} />}
                title={tracks.length ? T.hasilKosongTitle : T.kosongTitle}
                body={tracks.length ? T.hasilKosongBody : T.kosongBody}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}

/** Halaman Jelajahi (memakai `useSearchParams`, jadi `page.tsx` perlu membungkusnya dengan `<Suspense>`). */
export function MusikJelajahi() {
  const library = useMusikLibrary();
  const { params, update } = useJelajahiParams();
  return <MusikJelajahiView {...library} params={params} update={update} />;
}
