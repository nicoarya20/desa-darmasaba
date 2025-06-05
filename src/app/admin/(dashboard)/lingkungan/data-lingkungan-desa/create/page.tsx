'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { KeamananEditor } from '../../../keamanan/_com/keamananEditor';

function CreateDataLingkunganDesa() {
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
          <Title order={3}>Create Data Lingkungan Desa</Title>
          <TextInput
            label={<Text fz="sm" fw="bold">Nama Data Lingkungan Desa</Text>}
            placeholder="masukkan nama data lingkungan desa"
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Jumlah</Text>}
            placeholder="masukkan jumlah"
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Deskripsi</Text>}
            placeholder="masukkan deskripsi"
          />
          <Box>
            <Text fz="sm" fw="bold">Gambar</Text>
            <IconImageInPicture size={25} />
          </Box>
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
            <Text fw={"bold"} fz={"sm"}>Deskripsi Data Lingkungan Desa</Text>
            <KeamananEditor
              showSubmit={false}
            />
          </Box>
          <Button bg={colors['blue-button']} >
            Simpan Data
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateDataLingkunganDesa;
