'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import desaDigitalState from '@/app/admin/(dashboard)/_state/ekonomi/desa-digital';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPenghargaan() {
  const stateDesaDigital = useProxy(desaDigitalState)
  const router = useRouter()
  const params = useParams()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: stateDesaDigital.findUnique.data?.name || '',
    deskripsi: stateDesaDigital.findUnique.data?.deskripsi || '',
    imageId: stateDesaDigital.findUnique.data?.imageId || '',
  })

  useEffect(() => {
    const loadPenghargaan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateDesaDigital.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
          });

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading desa digital smart village:", error);
        toast.error("Gagal memuat data desa digital smart village");
      }
    };

    loadPenghargaan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateDesaDigital.edit.form = {
        ...stateDesaDigital.edit.form,
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

        stateDesaDigital.edit.form.imageId = uploaded.id;
      }

      await stateDesaDigital.edit.update();
      toast.success("Desa digital smart village berhasil diperbarui!");
      router.push("/admin/inovasi/desa-digital-smart-village");
    } catch (error) {
      console.error("Error updating desa digital smart village:", error);
      toast.error("Terjadi kesalahan saat memperbarui desa digital smart village");
    }
  }

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors["blue-button"]} size={30} />
        </Button>
      </Box>
      <Paper bg={"white"} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Edit Desa Digital Smart Village</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Judul</Text>}
            placeholder="masukkan judul"
          />
          <FileInput
            label={<Text fz={"sm"} fw={"bold"}>Upload Gambar Baru (Opsional)</Text>}
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
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }));
                stateDesaDigital.edit.form.deskripsi = htmlContent;
              }}
            />
          </Box>

          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPenghargaan;
