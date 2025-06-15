'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditSuratKeterangan() {
  const router = useRouter()
  const params = useParams()
  const stateSurat = useProxy(stateLayananDesa.suratKeterangan)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: stateSurat.edit.form.name,
    deskripsi: stateSurat.edit.form.deskripsi,
    imageId: stateSurat.edit.form.imageId,
  })

  useEffect(() => {
    const loadSurat = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const data = await stateSurat.edit.load(id);
        if (data) {
          setFormData({
            name: data.name,
            deskripsi: data.deskripsi,
            imageId: data.imageId,
          });
          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading surat:", error);
        toast.error("Gagal memuat data surat");
      }
    };
    loadSurat();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateSurat.edit.form = {
        ...stateSurat.edit.form,
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

        stateSurat.edit.form.imageId = uploaded.id;
      }

      await stateSurat.edit.update()
      toast.success("Surat berhasil diperbarui!")
      router.push("/admin/desa/layanan/pelayanan_surat_keterangan")
    } catch (error) {
      console.error("Error updating surat:", error);
      toast.error("Terjadi kesalahan saat memperbarui surat");
    }
  }


  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Edit Surat Keterangan</Title>
          <TextInput
            value={formData.name}
            onChange={(val) => {
              setFormData({ ...formData, name: val.target.value });
            }}
            label={<Text fz={"sm"} fw={"bold"}>Nama Surat Keterangan</Text>}
            placeholder="masukkan nama surat keterangan"
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Konten</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData({ ...formData, deskripsi: htmlContent });
              }}
            />
          </Box>
          <FileInput
            label={<Text fz={"sm"} fw={"bold"}>Upload Gambar Konten</Text>}
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
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditSuratKeterangan;
