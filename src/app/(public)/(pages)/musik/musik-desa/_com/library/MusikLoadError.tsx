import { IconCloudOff } from '@tabler/icons-react';
import { MusikEmpty } from './MusikEmpty';
import { MUSIK_TEXT as T } from './musik-library.text';
import s from './musik-empty.module.css';

/** Panel "Gagal memuat lagu" + tombol "Coba lagi" (memuat ulang lewat mesin). Menggantikan panel kosong saat API gagal. */
export function MusikLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <MusikEmpty
      icon={<IconCloudOff size={40} stroke={1.5} />}
      title={T.gagalTitle}
      body={T.gagalBody}
      action={
        <button type="button" className={s.retry} onClick={onRetry}>
          {T.cobaLagi}
        </button>
      }
    />
  );
}
