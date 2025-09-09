/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconDeviceFloppy, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import sdgsDesa from '../../../_state/landing-page/sdgs-desa';


function CreateSDGsDesa() {
  const router = useRouter();
  const stateSDGSDesa = useProxy(sdgsDesa)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);


  useEffect(() => {
    stateSDGSDesa.findMany.load();
  }, []);

  const resetForm = () => {
    stateSDGSDesa.create.form = {
      name: "",
      jumlah: "",
      imageId: "",
    };
    setFile(null);
    setPreviewImage(null);
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
      return toast.error("Gagal mengupload file");
    }

    stateSDGSDesa.create.form.imageId = uploaded.id;

    await stateSDGSDesa.create.create();

    resetForm();
    router.push("/admin/landing-page/sdgs")
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
          Tambah SDGs Desa
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
              Gambar SDGs Desa
            </Text>
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
              accept={{
                'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
              }}
              radius="md"
            >
              <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size={52} color={colors['blue-button']} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>

                <div style={{ textAlign: 'center' }}>
                  <Text size="xl" inline>
                    Drag file ke sini atau klik untuk memilih
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7} display="block">
                    Maksimal 5MB (JPEG, JPG, PNG, GIF, WEBP, SVG)
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="md">
                <Text fw={500} fz="sm" mb={4}>
                      Pratinjau Gambar
                    </Text>
                    <Box
                      style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        maxWidth: '300px'
                      }}
                    >
                      <Image
                        src={previewImage}
                        alt="Preview"
                        style={{ width: '100%', height: 'auto' }}
                      />
                    </Box>
              </Box>
            )}
          </Box>
          <TextInput
            label={
              <Text fw="bold" fz="sm" mb={4}>
                Nama SDGs Desa
              </Text>
            }
            placeholder="Masukkan nama SDGs Desa"
            value={stateSDGSDesa.create.form.name}
            onChange={(val) => {
              stateSDGSDesa.create.form.name = val.target.value;
            }}
            required
            radius="md"
          />

          <TextInput
            type="number"
            label={
              <Text fw="bold" fz="sm" mb={4}>
                Jumlah
              </Text>
            }
            placeholder="Masukkan jumlah"
            value={stateSDGSDesa.create.form.jumlah}
            onChange={(val) => {
              stateSDGSDesa.create.form.jumlah = val.target.value;
            }}
            required
            min={0}
            radius="md"
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              color="red"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={20} />}
              onClick={handleSubmit}
              loading={stateSDGSDesa.create.loading}
              color={colors['blue-button']}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateSDGsDesa;
