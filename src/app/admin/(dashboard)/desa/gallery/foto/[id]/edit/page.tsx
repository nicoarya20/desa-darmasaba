'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditFoto() {
  const fotoState = useProxy(stateGallery.foto)
  const router = useRouter();
  const params = useParams();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const loadFoto = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const data = await fotoState.update.load(id);
        if (data) {
          if (data?.imageGalleryFoto?.link) {
            setPreviewImage(data.imageGalleryFoto.link);
          }
        }
      } catch (error) {
        console.error('Error loading foto:', error);
        toast.error('Gagal memuat data foto');
      }
    };
    loadFoto();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name,
        });
        const uploaded = res.data?.data;
        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }
        fotoState.update.form.imagesId = uploaded.id;
      }
      await fotoState.update.update();
      toast.success('Foto berhasil diperbarui!');
      router.push('/admin/desa/gallery/foto');
    } catch (error) {
      console.error('Error updating foto:', error);
      toast.error('Terjadi kesalahan saat memperbarui foto');
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Edit Foto</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Judul Foto</Text>}
            placeholder='Masukkan judul foto'
            value={fotoState.update.form.name}
            onChange={(e) =>
              (fotoState.update.form.name = e.target.value)
            }
          />
          <FileInput
            label={<Text fz={"sm"} fw={"bold"}>Upload Gambar</Text>}
            value={file}
            onChange={async (e) => {
              if (!e) return;
              setFile(e);
              const base64 = await e.arrayBuffer().then((buf) =>
                "data:image/png;base64," + Buffer.from(buf).toString("base64")
              );
              setPreviewImage(base64);
            }}
          />
          {previewImage ? (
            <Image alt="" src={previewImage} w={200} h={200} />
          ) : (
            <Center w={200} h={200} bg={"gray"}>
              <IconImageInPicture />
            </Center>
          )}
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Foto</Text>
            <EditEditor
              value={fotoState.update.form.deskripsi}
              onChange={(val) => {
                fotoState.update.form.deskripsi = val;
              }}
            />
          </Box>
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditFoto;
