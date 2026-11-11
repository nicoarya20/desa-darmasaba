import { ActionIcon, Box, Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  MAX_LINK_PER_PRODUK,
  PLATFORM_LABEL,
  PLATFORM_TOKO_ONLINE,
  validateLinkTokoOnline,
  type LinkTokoOnlineInput,
} from '@/lib/link-toko-online';

const PLATFORM_OPTIONS = PLATFORM_TOKO_ONLINE.map((p) => ({ value: p, label: PLATFORM_LABEL[p] }));
const PLATFORM_DEFAULT = PLATFORM_TOKO_ONLINE[0];

/** Pesan error inline untuk satu baris; baris yang URL-nya masih kosong belum ditandai salah. */
function errorBaris(link: LinkTokoOnlineInput): string | undefined {
  if (link.url.trim() === '') return undefined;
  const cek = validateLinkTokoOnline(link);
  return cek.ok ? undefined : cek.message;
}

/** Section "Link Toko Online" di form produk UMKM: tambah/hapus baris, pilih platform, isi URL. */
export function LinkTokoOnlineField({
  value,
  onChange,
}: {
  value: LinkTokoOnlineInput[];
  onChange: (next: LinkTokoOnlineInput[]) => void;
}) {
  const ubahBaris = (index: number, patch: Partial<LinkTokoOnlineInput>) =>
    onChange(value.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  return (
    <Box>
      <Text fw={500} size="sm">Link Toko Online</Text>
      <Text size="xs" c="dimmed" mb="xs">
        Opsional, maksimal {MAX_LINK_PER_PRODUK} link (https). Urutan di sini = urutan tombol di halaman publik.
      </Text>
      <Stack gap="sm">
        {value.map((link, i) => (
          <Group key={i} align="flex-start" gap="xs" wrap="nowrap">
            <Select
              aria-label={`Platform link ${i + 1}`}
              data={PLATFORM_OPTIONS}
              value={link.platform}
              allowDeselect={false}
              onChange={(val) => ubahBaris(i, { platform: val || PLATFORM_DEFAULT })}
              w={{ base: 130, sm: 180 }}
            />
            <TextInput
              aria-label={`URL link ${i + 1}`}
              placeholder="https://..."
              value={link.url}
              error={errorBaris(link)}
              onChange={(e) => ubahBaris(i, { url: e.currentTarget.value })}
              style={{ flex: 1 }}
            />
            <ActionIcon
              color="red"
              variant="light"
              size="lg"
              aria-label={`Hapus link ${i + 1}`}
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ))}
        <Button
          variant="light"
          size="xs"
          w="fit-content"
          leftSection={<IconPlus size={14} />}
          disabled={value.length >= MAX_LINK_PER_PRODUK}
          onClick={() => onChange([...value, { platform: PLATFORM_DEFAULT, url: '' }])}
        >
          Tambah Link
        </Button>
      </Stack>
    </Box>
  );
}

export default LinkTokoOnlineField;
