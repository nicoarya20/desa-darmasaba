'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateSuratKeterangan() {
  const stateSurat = useProxy(stateLayananDesa.suratKeterangan)
  const [previewImage2, setPreviewImage2] = useState<{ preview: string; file: File } | null>(null);
  const [previewImage, setPreviewImage] = useState<{ preview: string; file: File } | null>(null);
  const router = useRouter()

  const resetForm = () => {
    stateSurat.create.form = {
      name: "",
      deskripsi: "",
      imageId: "",
      image2Id: ""
    }
    setPreviewImage(null)
    setPreviewImage2(null)
  }

  const handleSubmit = async () => {
    if (!previewImage) {
      return toast.warn("Pilih file gambar utama terlebih dahulu");
    }

    try {
      // Upload gambar utama
      const res1 = await ApiFetch.api.fileStorage.create.post({
        file: previewImage.file,
        name: `main_${previewImage.file.name}`,
      });

      const uploadedImage1 = res1.data?.data;
      if (!uploadedImage1?.id) {
        return toast.error("Gagal upload gambar utama");
      }

      let uploadedImage2 = null;
      // Upload gambar kedua jika ada
      if (previewImage2) {
        const res2 = await ApiFetch.api.fileStorage.create.post({
          file: previewImage2.file,
          name: `secondary_${previewImage2.file.name}`,
        });
        uploadedImage2 = res2.data?.data;
      }

      // Set form data
      stateSurat.create.form.imageId = uploadedImage1.id;
      if (uploadedImage2?.id) {
        stateSurat.create.form.image2Id = uploadedImage2.id;
      }

      // Create the record
      await stateSurat.create.create();

      // Reset form dan redirect
      resetForm();
      toast.success("Data surat keterangan berhasil ditambahkan");
      router.push("/admin/desa/layanan/pelayanan_surat_keterangan");
    } catch (error) {
      console.error("Error creating surat keterangan:", error);
      toast.error("Terjadi kesalahan saat menambahkan surat keterangan");
    }
  };
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Create Surat Keterangan</Title>
          <TextInput
            value={stateSurat.create.form.name}
            onChange={(val) => {
              stateSurat.create.form.name = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Nama Surat Keterangan</Text>}
            placeholder="masukkan nama surat keterangan"
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Konten</Text>
            <CreateEditor
              value={stateSurat.create.form.deskripsi}
              onChange={(htmlContent) => {
                stateSurat.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <Box>
            <Text fz={"md"} fw={"bold"} mb="sm">Gambar Utama</Text>
            <Dropzone
              onDrop={(files) => {
                const file = files[0];
                if (file) {
                  setPreviewImage({
                    file,
                    preview: URL.createObjectURL(file)
                  });
                }
              }}
              maxSize={5 * 1024 ** 2}
              accept={{
                'image/*': ['.jpeg', '.jpg', '.png', '.webp']
              }}
            >
              <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size={32} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={32} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={32} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
                <div>
                  <Text size="md" inline>Seret gambar ke sini atau klik untuk memilih</Text>
                  <Text size="sm" c="dimmed" inline mt={7} display="block">
                    Ukuran maksimal 5MB (JPEG, JPG, PNG, WebP)
                  </Text>
                </div>
              </Group>
            </Dropzone>
            {previewImage && (
              <Image
                src={previewImage.preview}
                alt="Preview Gambar Utama"
                width={280}
                height={180}
                fit="cover"
                radius="sm"
                mt="md"
              />
            )}
          </Box>

          <Box mt="lg">
            <Text fz={"md"} fw={"bold"} mb="sm">Gambar Tambahan (Opsional)</Text>
            <Dropzone
              onDrop={(files) => {
                const file = files[0];
                if (file) {
                  setPreviewImage2({
                    file,
                    preview: URL.createObjectURL(file)
                  });
                }
              }}
              maxSize={5 * 1024 ** 2}
              accept={{
                'image/*': ['.jpeg', '.jpg', '.png', '.webp']
              }}
            >
              <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size={32} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={32} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={32} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
                <div>
                  <Text size="md" inline>Seret gambar ke sini atau klik untuk memilih</Text>
                  <Text size="sm" c="dimmed" inline mt={7} display="block">
                    Ukuran maksimal 5MB (JPEG, JPG, PNG, WebP)
                  </Text>
                </div>
              </Group>
            </Dropzone>
            {previewImage2 ? (
              <Image
                src={previewImage2.preview}
                alt="Preview Gambar Tambahan"
                width={280}
                height={180}
                fit="cover"
                radius="sm"
                mt="md"
              />
            ) : (
              <Text size="sm" c="dimmed" mt="sm">
                Kosongkan jika tidak ada gambar tambahan
              </Text>
            )}
          </Box>
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateSuratKeterangan;
