import type { Metadata } from 'next';
import { MUSIK_PAGE_METADATA } from '../_com/app/musik-page.meta';
import { MusikPlaylist } from '../_com/library/MusikPlaylist';

export const metadata: Metadata = MUSIK_PAGE_METADATA.playlist;

/** Playlist kurasi admin desa (publik hanya memutar). */
export default function MusikPlaylistPage() {
  return <MusikPlaylist />;
}
