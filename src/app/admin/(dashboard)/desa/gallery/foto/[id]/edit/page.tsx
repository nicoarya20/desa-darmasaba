'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
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
  const fotoState = useProxy(stateGallery.foto)
  const router = useRouter();
  const params = useParams();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: fotoState.update.form.name || '',
    deskripsi: fotoState.update.form.deskripsi || '',
    imagesId: fotoState.update.form.imagesId || ''
  });

  useEffect(() => {
    const loadFoto = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const data = await fotoState.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            imagesId: data.imageGalleryFoto?.id || ''
          });
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
      fotoState.update.form = {
        ...fotoState.update.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        imagesId: formData.imagesId
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
              <Image alt="" src={previewImage} w={200} h={200} />
            ) : (
              <Center w={200} h={200} bg={"gray"}>
                <IconImageInPicture />
              </Center>
            )}
          </Box>
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
