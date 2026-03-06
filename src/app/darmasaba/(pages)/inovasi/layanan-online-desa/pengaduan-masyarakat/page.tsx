/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, Group, Image, Modal, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import { IconImageInPicture, IconMessageCircleQuestion, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function PengaduanMasyarakat() {
  const [opened, { open, close }] = useDisclosure(false);
  const state = useProxy(layananonlineDesa);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      state.pengaduanMasyarakat.create.form.name?.trim() !== '' &&
      state.pengaduanMasyarakat.create.form.email?.trim() !== '' &&
      state.pengaduanMasyarakat.create.form.nomorTelepon?.trim() !== '' &&
      state.pengaduanMasyarakat.create.form.nik?.trim() !== '' &&
      state.pengaduanMasyarakat.create.form.judulPengaduan?.trim() !== '' &&
      state.pengaduanMasyarakat.create.form.lokasiKejadian?.trim() !== '' &&
      !isHtmlEmpty(state.pengaduanMasyarakat.create.form.deskripsiPengaduan) &&
      state.pengaduanMasyarakat.create.form.jenisPengaduanId?.trim() !== '' &&
      file !== null
    );
  };

  useEffect(() => {
    // ✅ Panggil load data jenis layanan dari backend
    if (!state.jenisPengaduan.findMany.data) {
      state.jenisPengaduan.findMany.load();
    }
  }, []);

  const resetForm = () => {
    state.pengaduanMasyarakat.create.form = {
      name: '',
      email: '',
      nomorTelepon: '',
      nik: '',
      judulPengaduan: '',
      lokasiKejadian: '',
      deskripsiPengaduan: '',
      jenisPengaduanId: '',
      imageId: '',
    };
  };

  const resetAll = () => {
    resetForm();
    setFile(null);
    setPreviewImage(null);
  };


  const handleSubmit = async () => {
    if (!file) {
      return toast.error("Silahkan pilih file gambar terlebih dahulu")
    }

    try {
      // Upload the image first
      const uploadRes = await ApiFetch.api.fileStorage.create.post({
        file: file,
        name: file.name
      })

      const uploaded = uploadRes.data?.data
      if (!uploaded?.id) {
        return toast.error("Gagal upload gambar")
      }

      // Set the image ID in the form
      state.pengaduanMasyarakat.create.form.imageId = uploaded.id

      // Submit the form
      const success = await state.pengaduanMasyarakat.create.create()

      if (success) {
        resetAll()
        close()
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast.error("Terjadi kesalahan saat menyimpan data")
    }
  };
  return (
    <Box>
      <Stack >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.8 }}
          onClick={open}
        >
          <Paper p={'xl'} >
            <Box>
              <IconMessageCircleQuestion size={50} color={colors['blue-button']} />
            </Box>
            <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>Pengaduan Masyarakat</Text>
            <Text fz={'lg'} c={'black'}>Sampaikan keluhan dan aspirasi Anda melalui platform digital kami</Text>
          </Paper>
        </motion.div>
      </Stack>
      <Modal
        opened={opened}
        onClose={close}
        radius={0}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Title order={3}>Ajukan Pengaduan Masyarakat</Title>
            <TextInput
              label={<Text fz="sm" fw="bold">Nama</Text>}
              placeholder="Masukkan nama"
              onChange={(val) => (state.pengaduanMasyarakat.create.form.name = val.target.value)}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Email</Text>}
              placeholder="Masukkan email"
              onChange={(val) => (state.pengaduanMasyarakat.create.form.email = val.target.value)}
            />
            <TextInput
              type="number"
              label={<Text fz="sm" fw="bold">Nomor Telepon</Text>}
              placeholder="Masukkan nomor telepon"
              onChange={(val) => (state.pengaduanMasyarakat.create.form.nomorTelepon = val.target.value)}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">NIK</Text>}
              placeholder="Masukkan nik"
              onChange={(val) => (state.pengaduanMasyarakat.create.form.nik = val.target.value)}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Judul Pengaduan</Text>}
              placeholder="Masukkan judul pengaduan"
              onChange={(val) => (state.pengaduanMasyarakat.create.form.judulPengaduan = val.target.value)}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Lokasi Kejadian</Text>}
              placeholder="Masukkan lokasi kejadian"
              onChange={(val) => (state.pengaduanMasyarakat.create.form.lokasiKejadian = val.target.value)}
            />
            <Box>
              <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
              <CreateEditor
                value={state.pengaduanMasyarakat.create.form.deskripsiPengaduan}
                onChange={(htmlContent) => {
                  state.pengaduanMasyarakat.create.form.deskripsiPengaduan = htmlContent;
                }}
              />
            </Box>
            <Select
              value={state.pengaduanMasyarakat.create.form.jenisPengaduanId}
              onChange={(val) => {
                state.pengaduanMasyarakat.create.form.jenisPengaduanId = val ?? "";
              }}
              label={<Text fw={"bold"} fz={"sm"}>Jenis Pengaduan</Text>}
              placeholder="Pilih jenis pengaduan"
              data={
                state.jenisPengaduan.findMany.data?.map((v) => ({
                  value: v.id,
                  label: v.nama,
                })) || []
              }
            />
            <Box>
              <Text fz={"md"} fw={"bold"}>Gambar</Text>
              <Box>
                <Stack gap="xs">
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
                    accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
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
                          Drag images here or click to select files
                        </Text>
                        <Text size="sm" c="dimmed" inline mt={7}>
                          Attach as many files as you like, each file should not exceed 5mb
                        </Text>
                      </div>
                    </Group>
                  </Dropzone>
                  {previewImage ? (
                    <Image alt="" src={previewImage} w={200} h={200} loading="lazy" />
                  ) : (
                    <Center w={200} h={200} bg={"gray"}>
                      <IconImageInPicture />
                    </Center>
                  )}
                </Stack>
              </Box>
            </Box>

            <Button 
              bg={colors['blue-button']} 
              onClick={handleSubmit}
              disabled={!isFormValid()}
            >
              Simpan
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </Box>
  );
}

export default PengaduanMasyarakat;
