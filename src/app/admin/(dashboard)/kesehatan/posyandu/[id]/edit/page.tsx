/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import posyandustate from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditPosyandu() {
  const statePosyandu = useProxy(posyandustate)
  const router = useRouter();
  const params = useParams()

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: statePosyandu.edit.form.name || '',
    nomor: statePosyandu.edit.form.nomor || '',
    deskripsi: statePosyandu.edit.form.deskripsi || '',
    imageId: statePosyandu.edit.form.imageId || '',
  });

  useEffect(() => {
    const loadPosyandu = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await statePosyandu.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            nomor: data.nomor || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
          });

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading posyandu:", error);
        toast.error("Gagal memuat data posyandu");
      }
    }
    loadPosyandu();
  }, [params?.id])

  const handleSubmit = async () => {
    try {
      statePosyandu.edit.form = {
        ...statePosyandu.edit.form,
        name: formData.name,
        nomor: formData.nomor,
        deskripsi: formData.deskripsi,
        imageId: formData.imageId,
      }

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        statePosyandu.edit.form.imageId = uploaded.id;
      }

      await statePosyandu.edit.update();
      toast.success("Posyandu berhasil diperbarui!");
      router.push("/admin/kesehatan/posyandu");
    } catch (error) {
      console.error("Error updating posyandu:", error);
      toast.error("Gagal memuat data posyandu");
    }
  }

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Edit Posyandu</Title>
          {previewImage ? (
            <Image alt="" src={previewImage} w={200} h={200} />
          ) : (
            <Center w={200} h={200} bg={"gray"}>
              <IconImageInPicture />
            </Center>
          )}
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
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Nama Posyandu</Text>}
            placeholder='Masukkan nama posyandu'
          />
          <TextInput
            value={formData.nomor}
            onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Nomor Posyandu</Text>}
            placeholder='Masukkan nomor posyandu'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Posyandu</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData({ ...formData, deskripsi: htmlContent });
                statePosyandu.edit.form.deskripsi = htmlContent;
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

export default EditPosyandu;
