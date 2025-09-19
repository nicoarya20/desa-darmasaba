/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function CreateKegiatanDesa() {
  const router = useRouter();
  const stateKegiatanDesa = useProxy(gotongRoyongState.kegiatanDesa)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    stateKegiatanDesa.findMany.load();
    gotongRoyongState.kategoriKegiatan.findMany.load();
  }, []);

  const resetForm = () => {
    stateKegiatanDesa.create.form = {
      judul: "",
      deskripsiSingkat: "",
      deskripsiLengkap: "",
      tanggal: new Date(),
      lokasi: "",
      partisipan: 0,
      imageId: "",
      kategoriKegiatanId: "",
    };
    setPreviewImage(null);
    setFile(null);
  };
  const handleSubmit = async () => {
    if (!file) {
      return toast.warn("Pilih file gambar terlebih dahulu");
    }

    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    })

    const uploaded = res.data?.data;

    if (!uploaded?.id) {
      return toast.error("Gagal mengupload file");
    }

    stateKegiatanDesa.create.form.imageId = uploaded.id;

    await stateKegiatanDesa.create.create();

    resetForm();
    router.push("/admin/lingkungan/gotong-royong/kegiatan-desa")
  }
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Kegiatan Desa</Title>
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
                    loading="lazy"
                  />
                </Box>
              )}

            </Box>
          </Box>
          <TextInput
            value={stateKegiatanDesa.create.form.judul}
            onChange={(val) => {
              stateKegiatanDesa.create.form.judul = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Judul Kegiatan</Text>}
            placeholder='Masukkan judul kegiatan'
          />
          <TextInput
            value={stateKegiatanDesa.create.form.deskripsiSingkat}
            onChange={(val) => {
              stateKegiatanDesa.create.form.deskripsiSingkat = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Deskripsi Singkat</Text>}
            placeholder='Masukkan deskripsi singkat'
          />
          <TextInput
            type="number"
            min={0}
            max={5}
            step={0.1} // bisa pakai 0.1 biar support desimal
            value={stateKegiatanDesa.create.form.partisipan}
            onChange={(val) => {
              const value = Number(val.target.value);

              // Validasi manual juga boleh (jaga-jaga)
              if (value >= 0 && value <= 1000) {
                stateKegiatanDesa.create.form.partisipan = value;
              }
            }}
            label={<Text fw={"bold"} fz={"sm"}>Partisipan</Text>}
            placeholder='Masukkan partisipan'
          />
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Tanggal</Text>}
            type="date"
            placeholder="Contoh: 2022-01-01"
            value={stateKegiatanDesa.create.form.tanggal ? stateKegiatanDesa.create.form.tanggal.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const dateValue = e.currentTarget.value;
              stateKegiatanDesa.create.form.tanggal = dateValue ? new Date(dateValue) : new Date();
            }}
          />
          <TextInput
            value={stateKegiatanDesa.create.form.lokasi}
            onChange={(val) => {
              stateKegiatanDesa.create.form.lokasi = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Lokasi</Text>}
            placeholder='Masukkan lokasi'
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi Lengkap</Text>
            <CreateEditor
              value={stateKegiatanDesa.create.form.deskripsiLengkap}
              onChange={(val) => {
                stateKegiatanDesa.create.form.deskripsiLengkap = val;
              }}
            />
          </Box>
          <Select
            value={stateKegiatanDesa.create.form.kategoriKegiatanId}
            onChange={(val) => {
              stateKegiatanDesa.create.form.kategoriKegiatanId = val ?? "";
            }}
            label={<Text fw={"bold"} fz={"sm"}>Kategori Kegiatan</Text>}
            placeholder="Pilih kategori produk"
            data={
              gotongRoyongState.kategoriKegiatan.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama,
              })) || []
            }
          />

          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateKegiatanDesa;
