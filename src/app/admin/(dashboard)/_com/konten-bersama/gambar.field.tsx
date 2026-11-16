'use client'
import { ActionIcon, Box, Image, Stack, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import GambarDropzone from './gambar.dropzone';

type Props = {
  label: string;
  /** Gambar yang sudah tersimpan (tampil bila belum ada file baru dipilih). */
  currentUrl: string | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Bila diisi, gambar tersimpan bisa dikosongkan (field opsional, mis. foto bagan). */
  onHapusTersimpan?: () => void;
};

/** Field unggah satu gambar dengan preview; unggahan sebenarnya dilakukan saat form disimpan. */
export default function GambarField({ label, currentUrl, file, onFileChange, onHapusTersimpan }: Props) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const shownUrl = previewUrl ?? currentUrl;

  return (
    <Box>
      <Text fw="bold" fz="sm" mb={6}>{label}</Text>
      {shownUrl ? (
        <Stack gap="xs" align="flex-start">
          <Box pos="relative">
            <Image src={shownUrl} alt={label} w={240} maw="100%" radius="md" fit="cover" />
            {file && (
              <ActionIcon
                pos="absolute"
                top={8}
                right={8}
                color="red"
                variant="filled"
                radius="xl"
                aria-label="Batalkan gambar baru"
                onClick={() => onFileChange(null)}
              >
                <IconX size={16} />
              </ActionIcon>
            )}
            {!file && onHapusTersimpan && (
              <ActionIcon
                pos="absolute"
                top={8}
                right={8}
                color="red"
                variant="filled"
                radius="xl"
                aria-label={`Hapus ${label.toLowerCase()}`}
                onClick={onHapusTersimpan}
              >
                <IconX size={16} />
              </ActionIcon>
            )}
          </Box>
          <Text fz="xs" c="dimmed">Pilih file di bawah untuk mengganti gambar.</Text>
        </Stack>
      ) : null}
      <GambarDropzone onDrop={(files) => onFileChange(files[0] ?? null)} mt={shownUrl ? 'xs' : 0} />
    </Box>
  );
}
