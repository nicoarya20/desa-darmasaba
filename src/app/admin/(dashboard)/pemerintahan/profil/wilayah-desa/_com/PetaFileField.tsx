'use client';
import colors from '@/con/colors';
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import { Badge, Button, Group, Image, Input, Paper, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconExternalLink, IconFileTypePdf, IconMap, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import {
  PETA_FILE_ACCEPT,
  PETA_FILE_KETERANGAN,
  PETA_FILE_MAX_BYTES,
  periksaFilePilihan,
} from '../_lib/peta-file.logic';
import type { PetaFileApi } from '../_lib/usePetaFile';

/** Field "File Peta Wilayah" (gambar atau PDF, satu file): dropzone + kartu file dengan Lihat & Hapus. */
export function PetaFileField({ api, disabled }: { api: PetaFileApi; disabled: boolean }) {
  const { peta } = api;
  return (
    <Input.Wrapper label="File Peta Wilayah" description={PETA_FILE_KETERANGAN} error={api.error}>
      <Dropzone
        onDrop={(files) => files[0] && api.pilih(files[0])}
        onReject={(rejections) =>
          api.tolak((rejections[0] && periksaFilePilihan(rejections[0].file)) || 'File peta tidak valid')
        }
        maxSize={PETA_FILE_MAX_BYTES}
        accept={PETA_FILE_ACCEPT}
        multiple={false}
        disabled={disabled}
        radius="md"
        p="md"
        mt={6}
      >
        <Group justify="center" gap="md" mih={80}>
          <Dropzone.Accept>
            <IconUpload size={32} color={colors['blue-button']} stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={32} color="red" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconMap size={32} color="#868e96" stroke={1.5} />
          </Dropzone.Idle>
          <Text size="sm" fw={500} ta="center">
            {peta ? 'Seret file lain untuk mengganti' : 'Seret gambar atau PDF ke sini, atau klik untuk memilih'}
          </Text>
        </Group>
      </Dropzone>

      {peta && (
        <Paper withBorder radius="md" p="xs" mt="sm" data-peta-file>
          <Group justify="space-between" gap="xs">
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
              {peta.jenis === 'gambar' ? (
                <Image src={peta.link} alt="Pratinjau file peta" w={64} h={64} fit="cover" radius="sm" />
              ) : (
                <IconFileTypePdf size={32} color={colors['blue-button']} style={{ flexShrink: 0 }} aria-hidden />
              )}
              <Stack gap={0} style={{ minWidth: 0 }}>
                <Text fz="sm" truncate="end">
                  {peta.nama}
                </Text>
                <Text fz="xs" c="dimmed">
                  {peta.jenis === 'pdf' ? 'PDF' : 'Gambar'} · {formatUkuran(peta.size)}
                </Text>
              </Stack>
              {api.baru && (
                <Badge size="xs" variant="light">
                  Belum disimpan
                </Badge>
              )}
            </Group>
            <Group gap={4} wrap="nowrap">
              <Button
                component="a"
                href={peta.link}
                target="_blank"
                rel="noopener noreferrer"
                size="compact-xs"
                variant="light"
                leftSection={<IconExternalLink size={14} />}
              >
                Lihat
              </Button>
              <Button
                size="compact-xs"
                variant="light"
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={api.hapus}
                disabled={disabled}
              >
                Hapus
              </Button>
            </Group>
          </Group>
        </Paper>
      )}
    </Input.Wrapper>
  );
}
