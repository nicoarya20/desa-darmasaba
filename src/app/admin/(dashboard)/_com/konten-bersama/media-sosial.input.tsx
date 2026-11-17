'use client'
import {
  LABEL_PLATFORM,
  MAX_MEDIA_SOSIAL,
  PLATFORM_MEDIA_SOSIAL,
  lengkapiUrlMedsos,
  type MediaSosialItem,
  type PlatformMediaSosial,
} from '@/lib/konten-bersama/media-sosial.model';
import { isHttpUrl } from '@/lib/konten-bersama/tautan.validation';
import { ActionIcon, Box, Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

type Props = {
  value: readonly MediaSosialItem[];
  onChange: (value: MediaSosialItem[]) => void;
  label?: string;
};

const PILIHAN = PLATFORM_MEDIA_SOSIAL.map((value) => ({ value, label: LABEL_PLATFORM[value] }));

/**
 * Input daftar media sosial (semua domain): platform + URL per baris. Nama akun / nomor WhatsApp dilengkapi
 * menjadi URL saat kolom ditinggalkan; URL yang bukan http/https ditandai error (server juga menolaknya).
 */
export default function MediaSosialInput({ value, onChange, label = 'Media Sosial' }: Props) {
  const ubah = (index: number, patch: Partial<MediaSosialItem>) =>
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  return (
    <Box data-testid="media-sosial-input">
      <Text fw={500} fz="sm" mb={4}>{label}</Text>
      <Text fz="xs" c="dimmed" mb="xs">
        Isi URL lengkap, nama akun (mis. akun_desa), atau nomor WhatsApp.
      </Text>
      <Stack gap="xs">
        {value.map((item, index) => {
          const nomor = index + 1;
          const salah = item.url.trim() !== '' && !isHttpUrl(item.url.trim());
          return (
            <Group key={index} gap="xs" align="flex-start" wrap="nowrap">
              <Select
                aria-label={`Platform media sosial ${nomor}`}
                data={PILIHAN}
                value={item.platform}
                allowDeselect={false}
                w={170}
                onChange={(platform) => platform && ubah(index, { platform: platform as PlatformMediaSosial })}
              />
              <TextInput
                aria-label={`URL media sosial ${nomor}`}
                placeholder="https://..."
                style={{ flex: 1 }}
                value={item.url}
                error={salah ? 'URL harus diawali http:// atau https://' : undefined}
                onChange={(e) => ubah(index, { url: e.currentTarget.value })}
                onBlur={() => ubah(index, { url: lengkapiUrlMedsos(item.platform, item.url) })}
              />
              <ActionIcon
                variant="light"
                color="red"
                size="lg"
                aria-label={`Hapus media sosial ${nomor}`}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          );
        })}
      </Stack>
      <Button
        mt="xs"
        size="xs"
        variant="light"
        leftSection={<IconPlus size={14} />}
        disabled={value.length >= MAX_MEDIA_SOSIAL}
        onClick={() => onChange([...value, { platform: 'instagram', url: '' }])}
      >
        Tambah media sosial
      </Button>
    </Box>
  );
}
