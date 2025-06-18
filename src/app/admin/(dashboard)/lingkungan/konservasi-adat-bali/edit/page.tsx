'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

function EditKonservasiAdatBali() {
  const router = useRouter()
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Edit Konservasi Adat Bali</Title>
          <TextInput
            label={<Text fz="sm" fw="bold">Judul Konservasi Adat Bali</Text>}
            placeholder="masukkan judul konservasi adat bali"
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Deskripsi Konservasi Adat Bali</Text>}
            placeholder="masukkan deskripsi konservasi adat bali"
          />
          {/* <FileInput
          label={<Text fz="sm" fw="bold">Upload Gambar</Text>}
          value={file}
          onChange={async (e) => {
            if (!e) return;
            setFile(e);
            const base64 = await e.arrayBuffer().then((buf) =>
              'data:image/png;base64,' + Buffer.from(buf).toString('base64')
            );
            setPreviewImage(base64);
          }}
          />
          */}
          {/* {previewImage ? (
            <Image alt="" src={previewImage} w={200} h={200} />
          ) : (
            <Center w={200} h={200} bg="gray">
              <IconImageInPicture />
            </Center>
          )} */}
          <Group>
            <Button bg={colors['blue-button']}>
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKonservasiAdatBali;
