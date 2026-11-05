import { Button, Group, Text } from '@mantine/core';
import { IconBrandTiktok, IconExternalLink, IconShoppingBag } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import {
  PLATFORM_LABEL,
  isPlatformTokoOnline,
  isSafeHttpsUrl,
  type PlatformTokoOnline,
} from '../_lib/linkTokoOnline';

type LinkItem = { id?: string; platform: string; url: string };

const PLATFORM_COLOR: Record<PlatformTokoOnline, string> = {
  SHOPEE: 'orange',
  TOKOPEDIA: 'green',
  TIKTOK_SHOP: 'dark',
  BLIBLI: 'blue',
  LAZADA: 'indigo',
  LAINNYA: 'gray',
};

function platformIcon(platform: PlatformTokoOnline, size: number): ReactNode {
  if (platform === 'TIKTOK_SHOP') return <IconBrandTiktok size={size} />;
  if (platform === 'LAINNYA') return <IconExternalLink size={size} />;
  return <IconShoppingBag size={size} />;
}

/**
 * Tombol link toko online produk UMKM (ikon + nama platform, buka di tab baru).
 * Tidak merender apa pun bila produk tanpa link, sehingga tampilan lama tidak berubah.
 */
export function LinkTokoOnlineButtons({
  links,
  compact = false,
  withLabel = false,
}: {
  links?: LinkItem[] | null;
  /** Ukuran kecil untuk kartu katalog; klik tombol tidak memicu klik kartu. */
  compact?: boolean;
  /** Tampilkan teks pengantar "Beli juga di:" (detail produk). */
  withLabel?: boolean;
}) {
  const tampil = (links ?? []).filter(
    (l) => isPlatformTokoOnline(l.platform) && isSafeHttpsUrl(l.url),
  );
  if (tampil.length === 0) return null;

  return (
    <div onClick={compact ? (e) => e.stopPropagation() : undefined}>
      {withLabel && (
        <Text fz="sm" fw={600} mb={6}>
          Beli juga di:
        </Text>
      )}
      <Group gap={compact ? 6 : 'sm'}>
        {tampil.map((l, i) => {
          const platform = l.platform as PlatformTokoOnline;
          return (
            <Button
              key={l.id ?? `${platform}-${i}`}
              component="a"
              href={l.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              variant="light"
              color={PLATFORM_COLOR[platform]}
              size={compact ? 'compact-xs' : 'sm'}
              leftSection={platformIcon(platform, compact ? 14 : 18)}
            >
              {PLATFORM_LABEL[platform]}
            </Button>
          );
        })}
      </Group>
    </div>
  );
}

export default LinkTokoOnlineButtons;
