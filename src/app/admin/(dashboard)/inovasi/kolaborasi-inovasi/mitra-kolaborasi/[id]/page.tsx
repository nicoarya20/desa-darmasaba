'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import mitraKolaborasi from '@/app/admin/(dashboard)/_state/inovasi/mitra-kolaborasi';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconImageInPicture, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditFoto() {
  const state = useProxy(mitraKolaborasi)
  const router = useRouter();
  const params = useParams();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: state.update.form.name || '',
    imageId: state.update.form.imageId || ''
  });

  useEffect(() => {
    const loadFoto = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const data = await state.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            imageId: data.imageId || ''
          });
          if (data?.image?.link) {
            setPreviewImage(data.image.link);
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
      state.update.form = {
        ...state.update.form,
        name: formData.name,
        imageId: formData.imageId
      };
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name,
        });
        const uploaded = res.data?.data;
        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }
        state.update.form.imageId = uploaded.id;
      }
      await state.update.update();
      toast.success('Mitra berhasil diperbarui!');
      router.push('/admin/inovasi/kolaborasi-inovasi/mitra-kolaborasi');
    } catch (error) {
      console.error('Error updating mitra:', error);
      toast.error('Terjadi kesalahan saat memperbarui mitra');
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
          <Title order={4}>Edit Mitra</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Nama Mitra</Text>}
            placeholder='Masukkan nama mitra'
            value={formData.name}
            onChange={(e) =>
              (formData.name = e.target.value)
            }
          />
          <Box>
            <Text>Upload Foto</Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0]; // Ambil file pertama
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile)); // Buat preview
                }
              }}
              onReject={() => toast.error('File tidak valid.')}
              maxSize={5 * 1024 ** 2} // Maks 5MB
              accept={{ 'image/*': [] }}
            >
              <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Drag gambar ke sini atau klik untuk pilih file
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Maksimal 5MB dan harus format gambar
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {previewImage ? (
              <Image alt="" src={previewImage} w={200} h={200} loading="lazy"/>
            ) : (
              <Center w={200} h={200} bg={"gray"}>
                <IconImageInPicture />
              </Center>
            )}
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
