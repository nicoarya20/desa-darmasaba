/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import prestasiState from '@/app/admin/(dashboard)/_state/landing-page/prestasi-desa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function CreatePrestasiDesa() {
  const router = useRouter();
  const stateCreate = useProxy(prestasiState.prestasiDesa)
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);


  useEffect(() => {
    stateCreate.findMany.load();
    prestasiState.kategoriPrestasi.findMany.load();
  }, []);

  const resetForm = () => {
    stateCreate.create.form = {
      name: "",
      deskripsi: "",
      kategoriId: "",
      imageId: "",
    };
    setFile(null);
    setPreviewFile(null);
  };
  const handleSubmit = async () => {
    if (!file) {
      return toast.warn("Pilih file image terlebih dahulu");
    }

    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    })

    const uploaded = res.data?.data;

    if (!uploaded?.id) {
      return toast.error("Gagal mengupload image");
    }

    stateCreate.create.form.imageId = uploaded.id;

    await stateCreate.create.create();

    resetForm();
    router.push("/admin/landing-page/prestasi-desa/list-prestasi-desa")
  }
  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Prestasi Desa
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
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Prestasi
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewFile(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid. Hanya file gambar yang diperbolehkan.')}
              maxSize={5 * 1024 ** 2} // 5MB
              accept={{
                'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
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
                    Seret file gambar ke sini atau klik untuk memilih
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Unggah file gambar (maks. 5MB)
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {previewFile && (
              <Box mt="md">
                <Text size="sm" fw={500} mb={4}>
                  Pratinjau Gambar:
                </Text>
                <Box style={{ maxWidth: '100%', maxHeight: '300px', overflow: 'hidden', borderRadius: '8px' }}>
                  <Image
                    src={previewFile}
                    alt="Pratinjau gambar prestasi"
                    fit="cover"
                    style={{ width: '100%', height: 'auto' }}
                    loading='lazy'
                  />
                </Box>
              </Box>
            )}
          </Box>

          <TextInput
            label="Judul Prestasi"
            placeholder="Masukkan judul prestasi"
            defaultValue={stateCreate.create.form.name}
            onChange={(e) => (stateCreate.create.form.name = e.target.value)}
            required
          />

          <Box>
            <Text fw={500} fz="sm" mb={6}>
              Deskripsi Prestasi
            </Text>
            <CreateEditor
              value={stateCreate.create.form.deskripsi}
              onChange={(val) => (stateCreate.create.form.deskripsi = val)}
            />
          </Box>

          <Select
            label="Kategori Prestasi"
            placeholder="Pilih kategori"
            value={stateCreate.create.form.kategoriId}
            onChange={(val) => (stateCreate.create.form.kategoriId = val ?? '')}
            data={
              prestasiState.kategoriPrestasi.findMany.data?.map((v) => ({
                value: v.id,
                label: v.name,
              })) || []
            }
            required
          />

          <Group justify="space-between" mt="md">
            <Button
              variant="light"
              color="gray"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              bg={colors['blue-button']}
              style={{ boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)' }}
            >
              Simpan Prestasi
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePrestasiDesa;
