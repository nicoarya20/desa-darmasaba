'use client'
import { ActionIcon, Box, Group, Image, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';

const MAX_IMAGE_BYTES = 5 * 1024 ** 2;

type Props = {
  label: string;
  /** Gambar yang sudah tersimpan (tampil bila belum ada file baru dipilih). */
  currentUrl: string | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
};

/** Field unggah satu gambar BUMDes dengan preview; unggahan sebenarnya dilakukan saat form disimpan. */
export default function BumdesImageField({ label, currentUrl, file, onFileChange }: Props) {
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
          </Box>
          <Text fz="xs" c="dimmed">Pilih file di bawah untuk mengganti gambar.</Text>
        </Stack>
      ) : null}
      <Dropzone
        onDrop={(files) => onFileChange(files[0] ?? null)}
        maxSize={MAX_IMAGE_BYTES}
        multiple={false}
        accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
        mt={shownUrl ? 'xs' : 0}
        style={{ border: '2px dashed #ced4da', borderRadius: 8 }}
      >
        <Group justify="center" gap="md" mih={110} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept><IconUpload size={40} color="var(--mantine-color-blue-6)" stroke={1.5} /></Dropzone.Accept>
          <Dropzone.Reject><IconX size={40} color="var(--mantine-color-red-6)" stroke={1.5} /></Dropzone.Reject>
          <Dropzone.Idle><IconPhoto size={40} color="var(--mantine-color-dimmed)" stroke={1.5} /></Dropzone.Idle>
          <div>
            <Text size="sm" inline>Seret gambar ke sini atau klik untuk memilih file</Text>
            <Text size="xs" c="dimmed" inline mt={7}>JPG, PNG, WebP. Maksimal 5MB</Text>
          </div>
        </Group>
      </Dropzone>
    </Box>
  );
}
