'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
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
            Simpan Puskesmas
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePuskesmas;
