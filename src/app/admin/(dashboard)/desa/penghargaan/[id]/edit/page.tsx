'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import penghargaanState from '@/app/admin/(dashboard)/_state/desa/penghargaan';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Paper, Stack, Title, TextInput, FileInput, Center, Text, Image } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPenghargaan() {
  const statePenghargaan = useProxy(penghargaanState)
  const router = useRouter()
  const params = useParams()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: statePenghargaan.findUnique.data?.name || '',
    juara: statePenghargaan.findUnique.data?.juara || '',
    deskripsi: statePenghargaan.findUnique.data?.deskripsi || '',
    imageId: statePenghargaan.findUnique.data?.imageId || '',
  })

  useEffect(() => {
    const loadPenghargaan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await statePenghargaan.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            juara: data.juara || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
          });

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading penghargaan:", error);
        toast.error("Gagal memuat data penghargaan");
      }
    };

    loadPenghargaan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      statePenghargaan.edit.form = {
        ...statePenghargaan.edit.form,
        name: formData.name,
        juara: formData.juara,
        deskripsi: formData.deskripsi,
        imageId: formData.imageId,
      }

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        statePenghargaan.edit.form.imageId = uploaded.id;
      }

      await statePenghargaan.edit.update();
      toast.success("Penghargaan berhasil diperbarui!");
      router.push("/admin/desa/penghargaan");
    } catch (error) {
      console.error("Error updating penghargaan:", error);
      toast.error("Terjadi kesalahan saat memperbarui penghargaan");
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
          <Title order={3}>Edit Penghargaan</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Judul</Text>}
            placeholder="masukkan judul"
          />

          <TextInput
            value={formData.juara}
            onChange={(e) => setFormData({ ...formData, juara: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Juara</Text>}
            placeholder="masukkan juara"
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
                statePenghargaan.edit.form.deskripsi = htmlContent;
              }}
            />
          </Box>

          <Button onClick={handleSubmit}>Edit Penghargaan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPenghargaan;
