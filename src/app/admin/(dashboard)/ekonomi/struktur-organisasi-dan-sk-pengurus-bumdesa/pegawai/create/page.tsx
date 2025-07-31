/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import strukturorganisasiState from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePegawai() {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<{ preview: string; file: File } | null>(null);
  const stateOrganisasi = useProxy(strukturorganisasiState)
  useEffect(() => {
    stateOrganisasi.posisiOrganisasi.findMany.load();
    resetForm();
  }, []);

  const resetForm = () => {
    stateOrganisasi.pegawai.create.form = {
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
      stateOrganisasi.pegawai.create.form.isActive = true;
      
      // Simpan ID gambar ke form
      stateOrganisasi.pegawai.create.form.imageId = uploaded.id;
      
      // Submit form
      await stateOrganisasi.pegawai.create.submit();
      
      
      // Reset form dan redirect
      resetForm();
      toast.success("Data pegawai berhasil ditambahkan");
      router.push("/admin/ekonomi/Struktur-Organisasi-dan-SK-Pengurus-BUMDesa/pegawai");
    } catch (error) {
      console.error("Error creating pegawai:", error);
      toast.error("Terjadi kesalahan saat menambahkan pegawai");
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
          <Title order={3}>Create Pegawai</Title>
          <TextInput
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            value={stateOrganisasi.pegawai.create.form.namaLengkap}
            onChange={(e) => (stateOrganisasi.pegawai.create.form.namaLengkap = e.currentTarget.value)}
          />
          <TextInput
            label="Gelar Akademik"
            placeholder="Contoh: S.Kom"
            value={stateOrganisasi.pegawai.create.form.gelarAkademik}
            onChange={(e) => (stateOrganisasi.pegawai.create.form.gelarAkademik = e.currentTarget.value)}
          />
          <Box>
            <Text fz={"md"} fw={"bold"}>Gambar</Text>
            <Box >
              <Dropzone
                onDrop={(files) => {
                  const file = files[0]; // Hanya ambil file pertama
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
              {previewImage && (
                <Image
                  src={previewImage.preview}
                  alt="Preview"
                  width={280}
                  height={180}
                  fit="cover"
                  radius="sm"
                  mt="md"
                />
              )}
            </Box>
          </Box>
          <TextInput
            label="Tanggal Masuk"
            type="date"
            placeholder="Contoh: 2022-01-01"
            value={stateOrganisasi.pegawai.create.form.tanggalMasuk}
            onChange={(e) => (stateOrganisasi.pegawai.create.form.tanggalMasuk = e.currentTarget.value)}
          />
          <TextInput
            label="Email"
            placeholder="Contoh: email@example.com"
            value={stateOrganisasi.pegawai.create.form.email}
            onChange={(e) => (stateOrganisasi.pegawai.create.form.email = e.currentTarget.value)}
          />
          <TextInput
            label="Telepon"
            placeholder="Contoh: 08123456789"
            value={stateOrganisasi.pegawai.create.form.telepon}
            onChange={(e) => (stateOrganisasi.pegawai.create.form.telepon = e.currentTarget.value)}
          />
          <TextInput
            label="Alamat"
            placeholder="Contoh: Jl. Contoh No. 1"
            value={stateOrganisasi.pegawai.create.form.alamat}
            onChange={(e) => (stateOrganisasi.pegawai.create.form.alamat = e.currentTarget.value)}
          />
          <Select
            label="Posisi"
            placeholder="Pilih posisi"
            data={stateOrganisasi.posisiOrganisasi.findMany.data?.map(p => ({
              value: p.id,
              label: p.nama
            })) || []}
            value={stateOrganisasi.pegawai.create.form.posisiId}
            onChange={(value) => {
              if (value) stateOrganisasi.pegawai.create.form.posisiId = value;
            }}
            searchable
          />


          <Button
            onClick={handleSubmit}
            color="blue"
          >
            Simpan
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePegawai;
