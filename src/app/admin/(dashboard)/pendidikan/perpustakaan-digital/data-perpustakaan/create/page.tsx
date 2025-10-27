'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateDataPerpustakaan() {
  const createState = useProxy(perpustakaanDigitalState.dataPerpustakaan)
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    perpustakaanDigitalState.kategoriBuku.findMany.load();
  }, []);

  const resetForm = () => {
    createState.create.form = {
      judul: "",
      deskripsi: "",
      imageId: "",
      kategoriId: "",
    };
    setPreviewImage(null)
    setFile(null)
  };

  const handleSubmit = async () => {
    if (!file) {
      return toast.warn("Pilih file gambar terlebih dahulu");
    }

    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;
    if (!uploaded?.id) {
      return toast.error("Gagal upload gambar");
    }

    createState.create.form.imageId = uploaded.id;
    await createState.create.create();
    resetForm();
    router.push("/admin/pendidikan/perpustakaan-digital/data-perpustakaan")
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Tombol Kembali */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Data Perpustakaan
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
          {/* Judul */}
          <TextInput
            label={<Text fw="bold" fz="sm">Judul</Text>}
            placeholder='Masukkan judul'
            defaultValue={createState.create.form.judul}
            onChange={(val) => {
              createState.create.form.judul = val.target.value;
            }}
            required
          />

          {/* Deskripsi */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>Deskripsi</Text>
            <CreateEditor
              value={createState.create.form.deskripsi}
              onChange={(val) => { createState.create.form.deskripsi = val; }}
            />
          </Box>

          {/* Kategori */}
          <Select
            label={<Text fw="bold" fz="sm">Kategori</Text>}
            placeholder='Pilih kategori'
            value={createState.create.form.kategoriId || ""}
            onChange={(val) => { createState.create.form.kategoriId = val ?? ""; }}
            data={perpustakaanDigitalState.kategoriBuku.findMany.data?.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />

          {/* Gambar */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>Gambar</Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid.')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': [] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload size={48} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
              </Group>
              <Text ta="center" mt="sm" size="sm" color="dimmed">
                Drag gambar ke sini atau klik untuk pilih file (maks 5MB)
              </Text>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview"
                  radius="md"
                  style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
                  loading="lazy"
                />
              </Box>
            )}
          </Box>

          {/* Submit Button */}
          <Group justify="right">
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

export default CreateDataPerpustakaan;
