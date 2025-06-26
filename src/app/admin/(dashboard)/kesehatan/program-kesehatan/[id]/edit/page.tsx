/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import programKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/program-kesehatan/programKesehatan';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditProgramKesehatan() {
  const programKesehatanState = useProxy(programKesehatan)
  const router = useRouter();
  const params = useParams()

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: programKesehatanState.edit.form.name || '',
    deskripsiSingkat: programKesehatanState.edit.form.deskripsiSingkat || '',
    deskripsi: programKesehatanState.edit.form.deskripsi || '',
    imageId: programKesehatanState.edit.form.imageId || '',
  })

  useEffect(() => {
    const loadProgramKesehatan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await programKesehatanState.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsiSingkat: data.deskripsiSingkat || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
          });

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading program kesehatan:", error);
        toast.error("Gagal memuat data program kesehatan");
      }
    };

    loadProgramKesehatan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      programKesehatanState.edit.form = {
        ...programKesehatanState.edit.form,
        name: formData.name,
        deskripsiSingkat: formData.deskripsiSingkat,
        deskripsi: formData.deskripsi,
        imageId: formData.imageId,
      };

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        programKesehatanState.edit.form.imageId = uploaded.id;
      }

      await programKesehatanState.edit.update();
      toast.success("Program kesehatan berhasil diperbarui!");
      router.push("/admin/kesehatan/program-kesehatan");
    } catch (error) {
      console.error("Error updating program kesehatan:", error);
      toast.error("Gagal memuat data program kesehatan");
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
      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Edit Program Kesehatan</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fz="sm" fw="bold">Judul</Text>}
            placeholder="masukkan judul"
          />

          <TextInput
            value={formData.deskripsiSingkat}
            onChange={(e) => setFormData({ ...formData, deskripsiSingkat: e.target.value })}
            label={<Text fz="sm" fw="bold">Deskripsi Singkat</Text>}
            placeholder="masukkan deskripsi"
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
      </Stack>
    </Box >
  );
}

export default EditProgramKesehatan;
