'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { KesehatanEditor } from '../../_com/kesehatanEditor';

function CreateProgramKesehatan() {
  const router = useRouter();
  return (
     <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Create Program Kesehatan</Title>

          <TextInput
            
            label={<Text fz="sm" fw="bold">Judul</Text>}
            placeholder="masukkan judul"
          />

          <TextInput
            
            label={<Text fz="sm" fw="bold">Deskripsi</Text>}
            placeholder="masukkan deskripsi"
          />

          <TextInput
           
            label={<Text fz="sm" fw="bold">Kategori</Text>}
            placeholder="masukkan kategori"
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
          /> */}

          {/* {previewImage ? (
            <Image alt="" src={previewImage} w={200} h={200} />
          ) : (
            <Center w={200} h={200} bg="gray">
              <IconImageInPicture />
            </Center>
          )} */}

          <Box>
            <Text fz="sm" fw="bold">Konten</Text>
            <KesehatanEditor
              showSubmit={false}
            />
          </Box>

          <Button bg={colors['blue-button']}>
            Simpan Potensi
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateProgramKesehatan;
