'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import puskesmasState from '../../../_state/kesehatan/puskesmas/puskesmas';

function CreatePuskesmas() {
  const statePuskesmas = useProxy(puskesmasState)
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);


  const resetForm = () => {
    statePuskesmas.create.form = {
      name: "",
      alamat: "",
      jam: {
        workDays: "",
        weekDays: "",
        holiday: "",
      },
      kontak: {
        kontakPuskesmas: "",
        email: "",
        facebook: "",
        kontakUGD: "",
      },
      imageId: "",
      image: undefined,
    };

    setFile(null);
    setPreviewImage(null);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      return toast.warn("Pilih file gambar terlebih dahulu");
    }

    // Upload gambar dulu
    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;
    if (!uploaded?.id) {
      return toast.error("Gagal upload gambar");
    }

    statePuskesmas.create.form.imageId = uploaded.id;
    // State is already being updated directly in the form inputs

    await statePuskesmas.create.submit();

    toast.success("Data berhasil disimpan");
    resetForm();
    // After successful submission, redirect to the list page
    router.push('/admin/kesehatan/puskesmas');
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Create Puskesmas</Title>
          <TextInput
            label={<Text fz="sm" fw="bold">Nama Puskesmas</Text>}
            placeholder="masukkan nama puskesmas"
            value={statePuskesmas.create.form.name}
            onChange={(e) => {
              statePuskesmas.create.form.name = e.target.value;
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Alamat</Text>}
            placeholder="masukkan alamat"
            value={statePuskesmas.create.form.alamat}
            onChange={(e) => {
              statePuskesmas.create.form.alamat = e.target.value;
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Jam Buka</Text>}
            placeholder="masukkan jam buka"
            value={statePuskesmas.create.form.jam.workDays}
            onChange={(e) => {
              statePuskesmas.create.form.jam.workDays = e.target.value;
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Jam Tutup</Text>}
            placeholder="masukkan jam tutup"
            value={statePuskesmas.create.form.jam.weekDays}
            onChange={(e) => {
              statePuskesmas.create.form.jam.weekDays = e.target.value;
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Holiday</Text>}
            placeholder="masukkan holiday"
            value={statePuskesmas.create.form.jam.holiday}
            onChange={(e) => {
              statePuskesmas.create.form.jam.holiday = e.target.value;
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Kontak Puskesmas</Text>}
            placeholder="masukkan kontak puskesmas"
            value={statePuskesmas.create.form.kontak.kontakPuskesmas}
            onChange={(e) => {
              statePuskesmas.create.form.kontak.kontakPuskesmas = e.target.value;
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Email</Text>}
            placeholder="masukkan email"
            value={statePuskesmas.create.form.kontak.email}
            onChange={(e) => {
              statePuskesmas.create.form.kontak.email = e.target.value;
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Facebook</Text>}
            placeholder="masukkan facebook"
            value={statePuskesmas.create.form.kontak.facebook}
            onChange={(e) => {
              statePuskesmas.create.form.kontak.facebook = e.target.value;
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Kontak UGD</Text>}
            placeholder="masukkan kontak ugd"
            value={statePuskesmas.create.form.kontak.kontakUGD}
            onChange={(e) => {
              statePuskesmas.create.form.kontak.kontakUGD = e.target.value;
            }}
          />

          <Box>
            <Text fz={"md"} fw={"bold"}>Gambar</Text>
            <Box>
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

              {/* Tampilkan preview kalau ada */}
              {previewImage && (
                <Box mt="sm">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Button onClick={handleSubmit} bg={colors['blue-button']}>
            Simpan Puskesmas
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePuskesmas;
