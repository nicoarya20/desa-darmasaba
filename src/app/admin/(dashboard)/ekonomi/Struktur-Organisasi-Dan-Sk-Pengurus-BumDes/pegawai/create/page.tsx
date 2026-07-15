/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import stateStrukturBumDes from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { ActionIcon, Box, Button, Group, Image, Loader, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePegawaiBumDes() {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<{ preview: string; file: File } | null>(null);
  const stateOrganisasi = useProxy(stateStrukturBumDes.pegawai, { sync: true }) // sync: cegah caret jump di controlled input
  // Snapshot cabang posisiOrganisasi agar Select re-render saat findManyAll.load()
  // async selesai — JSX sebelumnya baca raw proxy (race intermiten, STG).
  const statePosisi = useProxy(stateStrukturBumDes.posisiOrganisasi)
  useEffect(() => {
    stateStrukturBumDes.posisiOrganisasi.findManyAll.load();
    resetForm();
  }, []);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      stateOrganisasi.create.form.namaLengkap?.trim() !== '' &&
      stateOrganisasi.create.form.posisiId?.trim() !== '' &&
      file !== null
    );
  };

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
    setPreviewImage(null);
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!previewImage) {
      return toast.warn("Pilih file gambar terlebih dahulu");
    }

    try {
      setIsSubmitting(true);
      // Upload gambar dulu
      if (!file) {
        return toast.warn('Silakan pilih file gambar terlebih dahulu');
      }
      const res = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      });
      const uploaded = res.data?.data;
      if (!uploaded?.id) {
        return toast.error('Gagal mengunggah gambar, silakan coba lagi');
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
      router.push("/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/pegawai");
    } catch (error) {
      console.error("Error creating pegawai:", error);
      toast.error("Terjadi kesalahan saat menambahkan pegawai");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Pegawai BUMDes
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
              value={stateOrganisasi.create.form.namaLengkap}
              onChange={(e) => (stateOrganisasi.create.form.namaLengkap = e.currentTarget.value)}
              required
            />
          </Box>
          <Box>
            <TextInput
              label="Gelar Akademik"
              placeholder="Contoh: S.Kom"
              value={stateOrganisasi.create.form.gelarAkademik}
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
              <Box mt="md" pos={"relative"}>
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
                <ActionIcon
                  variant="filled"
                  color="red"
                  radius="xl"
                  size="sm"
                  pos="absolute"
                  top={5}
                  right={5}
                  onClick={() => {
                    setPreviewImage(null);
                    setFile(null);
                  }}
                  style={{
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Box>
          <Box>
            <TextInput
              label="Tanggal Masuk"
              type="date"
              placeholder="Contoh: 2022-01-01"
              value={stateOrganisasi.create.form.tanggalMasuk}
              onChange={(e) => (stateOrganisasi.create.form.tanggalMasuk = e.currentTarget.value)}
            />
          </Box>

          <Box>
            <TextInput
              label="Email"
              type="email"
              placeholder="Contoh: email@example.com"
              value={stateOrganisasi.create.form.email}
              onChange={(e) => (stateOrganisasi.create.form.email = e.currentTarget.value)}
            />
          </Box>

          <Box>
            <TextInput
              label="Nomor Telepon"
              placeholder="Contoh: 08123456789"
              value={stateOrganisasi.create.form.telepon}
              inputMode="numeric"
              maxLength={13}
              onChange={(e) =>
                (stateOrganisasi.create.form.telepon = e.currentTarget.value
                  .replace(/\D/g, "")
                  .slice(0, 13))
              }
            />
          </Box>

          <Box>
            <TextInput
              label="Alamat"
              placeholder="Contoh: Jl. Contoh No. 1"
              value={stateOrganisasi.create.form.alamat}
              onChange={(e) => (stateOrganisasi.create.form.alamat = e.currentTarget.value)}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Posisi
            </Text>
            <Select
              placeholder="Pilih posisi"
              data={statePosisi.findManyAll.data?.map(p => ({
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
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
            </Button>

            {/* Tombol Simpan */}
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePegawaiBumDes;
