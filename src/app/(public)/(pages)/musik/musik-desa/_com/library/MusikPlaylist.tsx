import { IconPlaylist } from '@tabler/icons-react';
import { MusikEmpty } from './MusikEmpty';
import { MusikHeading } from './MusikHeading';
import { MUSIK_TEXT as T } from './musik-library.text';

/**
 * Halaman Playlist: kurasi admin, pengunjung hanya memutar (tidak bisa membuat).
 * TODO(musik-playlist): tunggu model & endpoint playlist — docs/BACKEND-TODO.md P3; sampai itu ada, selalu keadaan kosong.
 */
export function MusikPlaylist() {
  return (
    <div>
      <MusikHeading title={T.playlistTitle} lead={T.playlistLead} />
      <MusikEmpty icon={<IconPlaylist size={40} stroke={1.5} />} title={T.playlistKosongTitle} body={T.playlistKosongBody} />
    </div>
  );
}
