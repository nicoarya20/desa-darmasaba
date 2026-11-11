import { Badge } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

/** Penanda "Unggulan" untuk produk UMKM yang ditandai sebagai Produk Unggulan Desa. */
export function UnggulanBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <Badge
      color="yellow"
      variant="filled"
      size={size}
      leftSection={<IconStar size={12} fill="currentColor" />}
    >
      Unggulan
    </Badge>
  );
}

export default UnggulanBadge;
