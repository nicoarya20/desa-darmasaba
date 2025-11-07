/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import stateStrukturBumDes from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePegawaiBumDes() {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<{ preview: string; file: File } | null>(null);
  const stateOrganisasi = useProxy(stateStrukturBumDes.pegawai)
  useEffect(() => {
    stateStrukturBumDes.posisiOrganisasi.findManyAll.load();
    resetForm();
  }, []);

  const resetForm = () => {
    stateOrganisasi.create.form = {
      namaLengkap: "",
      gelarAkademik: "",
      imageId: "",
      tanggalMasuk: "",
      email: "",
      telepon: "",
      alamat: "",
      posisiId: "",
      isActive: true,
    };
  };

  const handleSubmit = async () => {
    if (!previewImage) {
      return toast.warn("Pilih file gambar terlebih dahulu");
    }

    try {
      // Upload gambar dulu
      const res = await ApiFetch.api.fileStorage.create.post({
        file: previewImage.file,
        name: previewImage.file.name,
      });

      const uploaded = res.data?.data;
      if (!uploaded?.id) {
        return toast.error("Gagal upload gambar");
      }

      // Set status aktif secara otomatis
      stateOrganisasi.create.form.isActive = true;

      // Simpan ID gambar ke form
      stateOrganisasi.create.form.imageId = uploaded.id;

      // Submit form
      await stateOrganisasi.create.submit();


      // Reset form dan redirect
      resetForm();
      toast.success("Data pegawai berhasil ditambahkan");
      router.push("/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/pegawai");
    } catch (error) {
      console.error("Error creating pegawai:", error);
      toast.error("Terjadi kesalahan saat menambahkan pegawai");
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Pegawai BUMDesa
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <Box>
            <TextInput
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              defaultValue={stateOrganisasi.create.form.namaLengkap}
              onChange={(e) => (stateOrganisasi.create.form.namaLengkap = e.currentTarget.value)}
              required
            />
          </Box>
          <Box>
            <TextInput
              label="Gelar Akademik"
              placeholder="Contoh: S.Kom"
              defaultValue={stateOrganisasi.create.form.gelarAkademik}
              onChange={(e) => (stateOrganisasi.create.form.gelarAkademik = e.currentTarget.value)}
            />
          </Box>
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Foto Profil
            </Text>
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
              maxSize={5 * 1024 ** 2} // 5MB
              accept={{
                'image/*': ['.jpeg', '.jpg', '.png', '.webp']
              }}
              styles={{
                root: {
                  border: '2px dashed #ced4da',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#228be6',
                  },
                },
              }}
            >
              <Group justify="center" gap="xl" mih={160} style={{ pointerEvents: 'none' }}>
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
                  <Text size="md" inline>
                    Seret gambar ke sini atau klik untuk memilih file
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Format yang didukung: JPG, PNG, WebP. Maksimal 5MB
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="md">
                <Text fw="bold" fz="sm" mb={6}>
                  Preview Gambar
                </Text>
                <Image
                  src={previewImage.preview}
                  alt="Preview"
                  width={200}
                  height={200}
                  fit="cover"
                  radius="md"
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                  loading='lazy'
                />
              </Box>
            )}
          </Box>
          <Box>
            <TextInput
              label="Tanggal Masuk"
              type="date"
              placeholder="Contoh: 2022-01-01"
              defaultValue={stateOrganisasi.create.form.tanggalMasuk}
              onChange={(e) => (stateOrganisasi.create.form.tanggalMasuk = e.currentTarget.value)}
            />
          </Box>

          <Box>
            <TextInput
              label="Email"
              type="email"
              placeholder="Contoh: email@example.com"
              defaultValue={stateOrganisasi.create.form.email}
              onChange={(e) => (stateOrganisasi.create.form.email = e.currentTarget.value)}
            />
          </Box>

          <Box>
            <TextInput
              label="Nomor Telepon"
              placeholder="Contoh: 08123456789"
              defaultValue={stateOrganisasi.create.form.telepon}
              onChange={(e) => (stateOrganisasi.create.form.telepon = e.currentTarget.value)}
            />
          </Box>

          <Box>
            <TextInput
              label="Alamat"
              placeholder="Contoh: Jl. Contoh No. 1"
              defaultValue={stateOrganisasi.create.form.alamat}
              onChange={(e) => (stateOrganisasi.create.form.alamat = e.currentTarget.value)}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Posisi
            </Text>
            <Select
              placeholder="Pilih posisi"
              data={stateStrukturBumDes.posisiOrganisasi.findManyAll.data?.map(p => ({
                value: p.id,
                label: p.nama
              })) || []}
              value={stateOrganisasi.create.form.posisiId}
              onChange={(value) => {
                if (value) stateOrganisasi.create.form.posisiId = value;
              }}
              searchable
              clearable
            />
          </Box>


          <Group justify="flex-end" mt="md">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePegawaiBumDes;
