/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import penangananDarurat from '@/app/admin/(dashboard)/_state/kesehatan/penanganan-darurat/penangananDarurat';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPenangananDarurat() {
  const penangananDaruratState = useProxy(penangananDarurat)
  const router = useRouter();
  const params = useParams()

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: penangananDaruratState.edit.form.name || '',
    deskripsi: penangananDaruratState.edit.form.deskripsi || '',
    imageId: penangananDaruratState.edit.form.imageId || '',
  })

  useEffect(() => {
    const loadPenangananDarurat = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await penangananDaruratState.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
          })

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error('Error loading penanganan darurat:', error);
        toast.error('Gagal memuat data penanganan darurat');
      }
    }

    loadPenangananDarurat();
  }, [params?.id])

  const handleSubmit = async () => {
    try {
      penangananDaruratState.edit.form = {
        ...penangananDaruratState.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        imageId: formData.imageId,
      }

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        penangananDaruratState.edit.form.imageId = uploaded.id;
      }

      await penangananDaruratState.edit.update();
      toast.success("Penanganan darurat berhasil diperbarui!");
      router.push("/admin/kesehatan/penanganan-darurat");
    } catch (error) {
      console.error("Error updating penanganan darurat:", error);
      toast.error("Gagal memuat data penanganan darurat");
    }
  }
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Stack gap={"xs"}>
        <Paper bg={colors['white-1']} p={"md"} w={{ base: '100%', md: '50%' }}>
          <Stack gap="xs">
            <Title order={3}>Edit Penanganan Darurat</Title>

            <TextInput
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              label={<Text fz="sm" fw="bold">Judul</Text>}
              placeholder="masukkan judul"
            />

            <Box>
              <Text fz="sm" fw="bold">Deskripsi</Text>
              <EditEditor
                value={formData.deskripsi}
                onChange={(val) => setFormData({ ...formData, deskripsi: val })}
              />
            </Box>

            <FileInput
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

            {previewImage ? (
              <Image alt="" src={previewImage} w={200} h={200} />
            ) : (
              <Center w={200} h={200} bg="gray">
                <IconImageInPicture />
              </Center>
            )}

            <Button onClick={handleSubmit} bg={colors['blue-button']}>
              Simpan
            </Button>
          </Stack>
        </Paper>
      </Stack >
    </Box >
  );
}

export default EditPenangananDarurat;
