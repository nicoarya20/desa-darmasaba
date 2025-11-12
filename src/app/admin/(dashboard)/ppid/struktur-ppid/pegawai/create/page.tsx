/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { ActionIcon, Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title, Loader } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePegawaiPPID() {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const stateOrganisasi = useProxy(stateStrukturPPID.pegawai)
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    stateStrukturPPID.posisiOrganisasi.findManyAll.load();
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
    setPreviewImage(null);
    setFile(null);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
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
      router.push("/admin/ppid/struktur-ppid/pegawai");
    } catch (error) {
      console.error("Error creating pegawai:", error);
      toast.error("Terjadi kesalahan saat menambahkan pegawai");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Pegawai PPID
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
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid, gunakan format gambar')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload size={48} color={colors['blue-button']} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="red" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="#868e96" stroke={1.5} />
                </Dropzone.Idle>
                <Stack gap="xs" align="center">
                  <Text size="md" fw={500}>
                    Seret gambar atau klik untuk memilih file
                  </Text>
                  <Text size="sm" c="dimmed">
                    Maksimal 5MB, format gambar .png, .jpg, .jpeg, webp
                  </Text>
                </Stack>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{
                    maxHeight: 200,
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                  }}
                  loading="lazy"
                />

                {/* Tombol hapus (pojok kanan atas) */}
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
              type='number'
              label="Nomor Telepon"
              placeholder="Contoh: 08123456789"
              value={stateOrganisasi.create.form.telepon}
              onChange={(e) => (stateOrganisasi.create.form.telepon = e.currentTarget.value)}
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
              label="Kategori"
              placeholder="Pilih kategori"
              data={stateStrukturPPID.posisiOrganisasi.findManyAll.data?.map((item) => ({
                label: item.nama,
                value: item.id,
              })) || []}
              value={stateOrganisasi.create.form.posisiId || null}
              onChange={(val: string | null) => {
                if (val) {
                  const selected = stateStrukturPPID.posisiOrganisasi.findManyAll.data?.find(
                    (item) => item.id === val
                  );
                  if (selected) {
                    stateOrganisasi.create.form.posisiId = selected.id;
                  }
                } else {
                  stateOrganisasi.create.form.posisiId = '';
                }
              }}
              searchable
              clearable
              nothingFoundMessage="Tidak ditemukan"
              required
            />
            {/* <Select
              placeholder="Pilih posisi"
              data={stateStrukturPPID.posisiOrganisasi.findManyAll.data?.map(p => ({
                value: p.id,
                label: p.nama
              })) || []}
              value={stateOrganisasi.create.form.posisiId}
              onChange={(value) => {
                if (value) stateOrganisasi.create.form.posisiId = value;
              }}
              searchable
              clearable
            /> */}
          </Box>


          {/* ======= Tombol Aksi ======= */}
          <Group justify="right">
            {/* Tombol Batal */}
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
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default CreatePegawaiPPID;
